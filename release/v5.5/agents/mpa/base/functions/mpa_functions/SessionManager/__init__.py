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

logger = logging.getLogger(__name__)

# Session table in Dataverse
SESSION_TABLE = "new_session"


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
    initial_context = req_body.get("context", {})

    session_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    session_data = {
        "eap_session_id": session_id,
        "eap_user_id": user_id,
        "eap_client_id": client_id,
        "eap_plan_id": plan_id,
        "eap_context": json.dumps(initial_context),
        "eap_status": "active",
        "eap_created_at": now,
        "eap_updated_at": now,
        "eap_started_at": now
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
    """Get session by ID."""
    session_id = req_body.get("session_id")

    try:
        safe_session_id = sanitize_odata_guid(session_id)
        results = client.query_records(
            table_name=SESSION_TABLE,
            filter_query=f"eap_session_id eq '{safe_session_id}'",
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
            context = json.loads(session.get("eap_context", "{}"))
        except json.JSONDecodeError:
            pass

        return func.HttpResponse(
            json.dumps({
                "status": "success",
                "session": {
                    "session_id": session.get("eap_session_id"),
                    "user_id": session.get("eap_user_id"),
                    "client_id": session.get("eap_client_id"),
                    "plan_id": session.get("eap_plan_id"),
                    "context": context,
                    "status": session.get("eap_status"),
                    "created_at": session.get("eap_created_at"),
                    "updated_at": session.get("eap_updated_at")
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
        # Get existing session
        safe_session_id = sanitize_odata_guid(session_id)
        results = client.query_records(
            table_name=SESSION_TABLE,
            filter_query=f"eap_session_id eq '{safe_session_id}'",
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
        record_id = session.get("eap_sessionid")  # Dataverse internal ID

        # Merge context
        existing_context = {}
        try:
            existing_context = json.loads(session.get("eap_context", "{}"))
        except json.JSONDecodeError:
            pass

        merged_context = {**existing_context, **context_updates}
        now = datetime.utcnow().isoformat()

        update_data = {
            "eap_context": json.dumps(merged_context),
            "eap_updated_at": now
        }

        if plan_id:
            update_data["eap_plan_id"] = plan_id

        client.update_record(SESSION_TABLE, record_id, update_data)

        return func.HttpResponse(
            json.dumps({
                "status": "success",
                "session": {
                    "session_id": session_id,
                    "context": merged_context,
                    "plan_id": plan_id or session.get("eap_plan_id"),
                    "updated_at": now
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
        # Get existing session
        safe_session_id = sanitize_odata_guid(session_id)
        results = client.query_records(
            table_name=SESSION_TABLE,
            filter_query=f"eap_session_id eq '{safe_session_id}'",
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
            "eap_status": "ended",
            "eap_ended_at": now,
            "eap_updated_at": now
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
