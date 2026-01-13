"""
Session Manager Azure Function

Manages user sessions for the Media Planning Agent.
Sessions track context, current plan, and user state.
"""

import azure.functions as func
import json
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

from ..shared.dataverse_client import DataverseClient
from ..shared.validators import validate_session_request
from ..shared.odata_sanitization import sanitize_odata_guid
from ..shared.table_config import TABLES

logger = logging.getLogger(__name__)

# Session table in Dataverse (Entity Set Name - plural form)
SESSION_TABLE = TABLES["session"]  # "eap_sessions"


def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Session Manager Azure Function

    Actions:
    - create: Create a new session
    - get: Get session by ID
    - update: Update session context
    - end: End a session

    All session data is stored in Dataverse.
    """
    logger.info('SessionManager function processing request.')

    try:
        req_body = req.get_json()

        # Validate request
        validation = validate_session_request(req_body)
        if not validation.is_valid:
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "error_code": "VALIDATION_ERROR",
                    "message": validation.error_message,
                    "details": validation.errors
                }),
                status_code=400,
                mimetype="application/json"
            )

        action = req_body.get("action")
        client = DataverseClient()

        if action == "create":
            return create_session(client, req_body)
        elif action == "get":
            return get_session(client, req_body)
        elif action == "update":
            return update_session(client, req_body)
        elif action == "end":
            return end_session(client, req_body)
        else:
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "error_code": "INVALID_ACTION",
                    "message": f"Unknown action: {action}"
                }),
                status_code=400,
                mimetype="application/json"
            )

    except json.JSONDecodeError:
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "INVALID_JSON",
                "message": "Request body must be valid JSON"
            }),
            status_code=400,
            mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"SessionManager error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "INTERNAL_ERROR",
                "message": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )


def create_session(client: DataverseClient, req_body: Dict[str, Any]) -> func.HttpResponse:
    """Create a new session."""
    user_id = req_body.get("user_id")
    client_id = req_body.get("client_id")
    plan_id = req_body.get("plan_id")
    agent_code = req_body.get("agent_code", "MPA")  # Default to MPA agent
    initial_context = req_body.get("context", {})

    session_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    # Generate session code (shorter identifier for display)
    session_code = f"SES-{session_id[:8].upper()}"

    session_data = {
        "eap_sessioncode": session_code,
        "eap_agentcode": agent_code,  # Required field
        "eap_userid": user_id,
        "eap_clientid": client_id,
        "eap_planid": plan_id,
        "eap_sessiondata": json.dumps(initial_context),
        "eap_status": 200000000,  # Active status (Dataverse Picklist value)
        "eap_startedat": now
    }

    try:
        result = client.create_record(SESSION_TABLE, session_data)

        return func.HttpResponse(
            json.dumps({
                "status": "success",
                "session": {
                    "session_id": session_id,
                    "user_id": user_id,
                    "client_id": client_id,
                    "plan_id": plan_id,
                    "context": initial_context,
                    "status": "active",
                    "created_at": now
                }
            }),
            status_code=201,
            mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "CREATE_FAILED",
                "message": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )


def get_session(client: DataverseClient, req_body: Dict[str, Any]) -> func.HttpResponse:
    """Get session by ID or session code."""
    session_id = req_body.get("session_id")

    try:
        safe_session_id = sanitize_odata_guid(session_id)
        # Try to find by session code first, then by GUID
        results = client.query_records(
            table_name=SESSION_TABLE,
            filter_query=f"eap_sessioncode eq '{safe_session_id}' or eap_sessionid eq {safe_session_id}",
            top=1
        )

        if not results:
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "error_code": "NOT_FOUND",
                    "message": f"Session not found: {session_id}"
                }),
                status_code=404,
                mimetype="application/json"
            )

        session = results[0]
        context = {}
        try:
            context = json.loads(session.get("eap_sessiondata", "{}"))
        except json.JSONDecodeError:
            pass

        return func.HttpResponse(
            json.dumps({
                "status": "success",
                "session": {
                    "session_id": session.get("eap_sessionid"),
                    "session_code": session.get("eap_sessioncode"),
                    "user_id": session.get("eap_userid"),
                    "client_id": session.get("eap_clientid"),
                    "plan_id": session.get("eap_planid"),
                    "context": context,
                    "status": session.get("eap_status"),
                    "started_at": session.get("eap_startedat"),
                    "ended_at": session.get("eap_endedat"),
                    "created_at": session.get("createdon"),
                    "updated_at": session.get("modifiedon")
                }
            }),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"Error getting session: {e}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "GET_FAILED",
                "message": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )


def update_session(client: DataverseClient, req_body: Dict[str, Any]) -> func.HttpResponse:
    """Update session context."""
    session_id = req_body.get("session_id")
    context_updates = req_body.get("context", {})
    plan_id = req_body.get("plan_id")

    try:
        # Get existing session by code or GUID
        safe_session_id = sanitize_odata_guid(session_id)
        results = client.query_records(
            table_name=SESSION_TABLE,
            filter_query=f"eap_sessioncode eq '{safe_session_id}' or eap_sessionid eq {safe_session_id}",
            top=1
        )

        if not results:
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "error_code": "NOT_FOUND",
                    "message": f"Session not found: {session_id}"
                }),
                status_code=404,
                mimetype="application/json"
            )

        session = results[0]
        record_id = session.get("eap_sessionid")  # Dataverse record GUID

        # Merge context
        existing_context = {}
        try:
            existing_context = json.loads(session.get("eap_sessiondata", "{}"))
        except json.JSONDecodeError:
            pass

        merged_context = {**existing_context, **context_updates}

        update_data = {
            "eap_sessiondata": json.dumps(merged_context)
        }

        if plan_id:
            update_data["eap_planid"] = plan_id

        client.update_record(SESSION_TABLE, record_id, update_data)

        return func.HttpResponse(
            json.dumps({
                "status": "success",
                "session": {
                    "session_id": record_id,
                    "session_code": session.get("eap_sessioncode"),
                    "context": merged_context,
                    "plan_id": plan_id or session.get("eap_planid")
                }
            }),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"Error updating session: {e}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "UPDATE_FAILED",
                "message": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )


def end_session(client: DataverseClient, req_body: Dict[str, Any]) -> func.HttpResponse:
    """End a session."""
    session_id = req_body.get("session_id")

    try:
        # Get existing session by code or GUID
        safe_session_id = sanitize_odata_guid(session_id)
        results = client.query_records(
            table_name=SESSION_TABLE,
            filter_query=f"eap_sessioncode eq '{safe_session_id}' or eap_sessionid eq {safe_session_id}",
            top=1
        )

        if not results:
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "error_code": "NOT_FOUND",
                    "message": f"Session not found: {session_id}"
                }),
                status_code=404,
                mimetype="application/json"
            )

        session = results[0]
        record_id = session.get("eap_sessionid")
        now = datetime.utcnow().isoformat()

        update_data = {
            "eap_status": 200000002,  # Completed status (Dataverse Picklist value)
            "eap_endedat": now
        }

        client.update_record(SESSION_TABLE, record_id, update_data)

        return func.HttpResponse(
            json.dumps({
                "status": "success",
                "session": {
                    "session_id": session_id,
                    "status": "ended",
                    "ended_at": now
                }
            }),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"Error ending session: {e}")
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error_code": "END_FAILED",
                "message": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )
