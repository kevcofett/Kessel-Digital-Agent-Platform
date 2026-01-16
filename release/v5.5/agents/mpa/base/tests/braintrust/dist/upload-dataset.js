/**
 * Upload MPA Evaluation Dataset to Braintrust
 *
 * This script uploads the JSON dataset to Braintrust using the REST API.
 */
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load .env from the vercel-ai-gateway directory (use absolute path)
const envPath = "/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/integrations/vercel-ai-gateway/.env";
config({ path: envPath });
const API_BASE = "https://api.braintrust.dev/v1";
async function uploadDataset() {
    const apiKey = process.env.BRAINTRUST_API_KEY;
    if (!apiKey) {
        throw new Error("BRAINTRUST_API_KEY not found in environment");
    }
    console.log("API Key found:", apiKey.slice(0, 10) + "...");
    // Load the dataset JSON
    const datasetPath = path.join(__dirname, "mpa-evaluation-dataset.json");
    const datasetJson = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
    console.log(`Uploading dataset: ${datasetJson.name}`);
    console.log(`Test cases: ${datasetJson.test_cases.length}`);
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
    };
    // Step 1: Get or create the project
    console.log("\n1. Getting/creating project...");
    let projectResponse = await fetch(`${API_BASE}/project?project_name=Kessel-MPA-Agent`, {
        headers,
    });
    const projectText = await projectResponse.text();
    console.log("   Raw project response:", projectText.slice(0, 500));
    let projects;
    try {
        projects = JSON.parse(projectText);
    }
    catch (e) {
        console.error("   Failed to parse project response");
        throw e;
    }
    let projectId;
    if (projects.objects && projects.objects.length > 0) {
        projectId = projects.objects[0].id;
        console.log(`   Found existing project: ${projectId}`);
    }
    else {
        // Create the project
        console.log("   Creating new project...");
        const createProjectResp = await fetch(`${API_BASE}/project`, {
            method: "POST",
            headers,
            body: JSON.stringify({ name: "Kessel-MPA-Agent" }),
        });
        const createProjectText = await createProjectResp.text();
        console.log("   Create project response:", createProjectText.slice(0, 500));
        const newProject = JSON.parse(createProjectText);
        projectId = newProject.id;
        console.log(`   Created new project: ${projectId}`);
    }
    // Step 2: Create or get the dataset
    console.log("\n2. Getting/creating dataset...");
    const datasetName = "MPA v5.7 Evaluation Dataset";
    let datasetResponse = await fetch(`${API_BASE}/dataset?project_id=${projectId}&dataset_name=${encodeURIComponent(datasetName)}`, { headers });
    let datasets = await datasetResponse.json();
    let datasetId;
    if (datasets.objects && datasets.objects.length > 0) {
        datasetId = datasets.objects[0].id;
        console.log(`   Found existing dataset: ${datasetId}`);
    }
    else {
        // Create the dataset
        const createDatasetResp = await fetch(`${API_BASE}/dataset`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                project_id: projectId,
                name: datasetName,
                description: datasetJson.description,
            }),
        });
        const newDataset = await createDatasetResp.json();
        datasetId = newDataset.id;
        console.log(`   Created new dataset: ${datasetId}`);
    }
    // Step 3: Insert test cases into the dataset
    console.log("\n3. Inserting test cases...");
    const events = datasetJson.test_cases.map((testCase) => ({
        id: testCase.id,
        input: {
            message: testCase.input,
            context: testCase.context || null,
        },
        metadata: {
            name: testCase.name,
            ...testCase.metadata,
            expected_behaviors: testCase.expected_behaviors,
            anti_patterns: testCase.anti_patterns || [],
            ideal_response: testCase.ideal_response || null,
        },
        // expected is optional but useful for scoring
        expected: {
            behaviors: testCase.expected_behaviors,
            ideal_response: testCase.ideal_response || null,
        },
    }));
    const insertResponse = await fetch(`${API_BASE}/dataset/${datasetId}/insert`, {
        method: "POST",
        headers,
        body: JSON.stringify({ events }),
    });
    if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        throw new Error(`Failed to insert events: ${insertResponse.status} - ${errorText}`);
    }
    const insertResult = await insertResponse.json();
    console.log(`   Inserted ${events.length} test cases`);
    console.log(`   Response:`, JSON.stringify(insertResult, null, 2));
    // Step 4: Verify the dataset
    console.log("\n4. Verifying dataset...");
    const verifyResponse = await fetch(`${API_BASE}/dataset/${datasetId}/fetch?limit=3`, {
        headers,
    });
    const verifyResult = await verifyResponse.json();
    console.log(`   Dataset has ${verifyResult.events?.length || 0} events (showing first 3)`);
    console.log("\n✅ Dataset uploaded successfully!");
    console.log(`   Project: Kessel-MPA-Agent (${projectId})`);
    console.log(`   Dataset: ${datasetName} (${datasetId})`);
    console.log(`   Records: ${events.length} test cases`);
    return { projectId, datasetId, count: events.length };
}
uploadDataset()
    .then((result) => {
    console.log("\nDone! You can now use this dataset in Braintrust evaluations.");
    console.log(`Visit: https://www.braintrust.dev/app/Kessel-MPA-Agent/datasets`);
    process.exit(0);
})
    .catch((error) => {
    console.error("Error uploading dataset:", error);
    process.exit(1);
});
//# sourceMappingURL=upload-dataset.js.map