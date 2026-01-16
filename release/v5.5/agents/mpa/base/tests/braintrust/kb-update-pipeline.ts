/**
 * KB Document Update Pipeline
 *
 * Programmatically updates KB documents based on impact analysis,
 * uploads to SharePoint, and tracks changes for before/after comparison.
 *
 * Pipeline stages:
 * 1. Analyze KB impact from evaluation results
 * 2. Generate optimization recommendations
 * 3. Apply updates to local KB files
 * 4. Upload updated files to SharePoint
 * 5. Track baseline for comparison
 * 6. Trigger re-evaluation with updated KB
 *
 * Usage:
 *   # Analyze and generate recommendations (no changes)
 *   npx ts-node --esm kb-update-pipeline.ts --analyze
 *
 *   # Apply recommendations and upload to SharePoint
 *   npx ts-node --esm kb-update-pipeline.ts --apply --upload
 *
 *   # Full pipeline: analyze, apply, upload, re-evaluate
 *   npx ts-node --esm kb-update-pipeline.ts --full-pipeline
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import {
  MPA_KB_DOCUMENTS,
  KBImpactMetrics,
  KBOptimizationRecommendation,
  generateKBOptimizationRecommendations,
  generateKBImpactReport,
} from "./kb-impact-tracker.js";

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Paths to KB documents
 */
const KB_BASE_PATH = path.join(__dirname, "..", "..", "kb");

/**
 * Path to store KB baselines
 */
const KB_BASELINE_PATH = path.join(__dirname, "kb-baselines");

/**
 * SharePoint configuration (from environment)
 */
const SHAREPOINT_CONFIG = {
  siteUrl: process.env.SHAREPOINT_SITE_URL || "",
  libraryName: process.env.SHAREPOINT_LIBRARY_NAME || "MPA KB Documents",
  clientId: process.env.SHAREPOINT_CLIENT_ID || "",
  clientSecret: process.env.SHAREPOINT_CLIENT_SECRET || "",
  tenantId: process.env.SHAREPOINT_TENANT_ID || "",
};

// =============================================================================
// KB BASELINE MANAGEMENT
// =============================================================================

/**
 * KB baseline record - tracks document versions before/after optimization
 */
export interface KBBaselineRecord {
  timestamp: number;
  promptVersion: string;
  documents: {
    id: string;
    filename: string;
    version: string;
    contentHash: string;
    lastModified: string;
  }[];
  evaluationResults?: {
    overallComposite: number;
    perScenarioScores: Record<string, number>;
  };
}

/**
 * Calculate content hash for a file
 */
function calculateContentHash(content: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

/**
 * Create a baseline snapshot of current KB documents
 */
function createKBBaseline(promptVersion: string): KBBaselineRecord {
  const documents: KBBaselineRecord["documents"] = [];

  for (const doc of MPA_KB_DOCUMENTS) {
    const filePath = path.join(KB_BASE_PATH, doc.filename);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const stats = fs.statSync(filePath);

      documents.push({
        id: doc.id,
        filename: doc.filename,
        version: doc.version,
        contentHash: calculateContentHash(content),
        lastModified: stats.mtime.toISOString(),
      });
    } else {
      console.warn(`KB document not found: ${filePath}`);
    }
  }

  return {
    timestamp: Date.now(),
    promptVersion,
    documents,
  };
}

/**
 * Save KB baseline to file
 */
function saveKBBaseline(baseline: KBBaselineRecord, label?: string): string {
  if (!fs.existsSync(KB_BASELINE_PATH)) {
    fs.mkdirSync(KB_BASELINE_PATH, { recursive: true });
  }

  const filename = label
    ? `kb-baseline-${label}-${baseline.timestamp}.json`
    : `kb-baseline-${baseline.timestamp}.json`;
  const filePath = path.join(KB_BASELINE_PATH, filename);

  fs.writeFileSync(filePath, JSON.stringify(baseline, null, 2));
  console.log(`KB baseline saved: ${filePath}`);

  return filePath;
}

/**
 * Load most recent KB baseline
 */
function loadLatestKBBaseline(): KBBaselineRecord | null {
  if (!fs.existsSync(KB_BASELINE_PATH)) {
    return null;
  }

  const files = fs.readdirSync(KB_BASELINE_PATH)
    .filter((f) => f.startsWith("kb-baseline-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    return null;
  }

  const filePath = path.join(KB_BASELINE_PATH, files[0]);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

/**
 * Compare two KB baselines
 */
function compareKBBaselines(
  before: KBBaselineRecord,
  after: KBBaselineRecord
): {
  changed: string[];
  added: string[];
  removed: string[];
  unchanged: string[];
} {
  const beforeDocs = new Map(before.documents.map((d) => [d.id, d]));
  const afterDocs = new Map(after.documents.map((d) => [d.id, d]));

  const changed: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];
  const unchanged: string[] = [];

  for (const [id, afterDoc] of afterDocs) {
    const beforeDoc = beforeDocs.get(id);
    if (!beforeDoc) {
      added.push(id);
    } else if (beforeDoc.contentHash !== afterDoc.contentHash) {
      changed.push(id);
    } else {
      unchanged.push(id);
    }
  }

  for (const [id] of beforeDocs) {
    if (!afterDocs.has(id)) {
      removed.push(id);
    }
  }

  return { changed, added, removed, unchanged };
}

// =============================================================================
// KB DOCUMENT UPDATES
// =============================================================================

/**
 * Update types supported by the pipeline
 */
export enum KBUpdateType {
  ADD_BENCHMARK = "add_benchmark",
  CLARIFY_SECTION = "clarify_section",
  ADD_EXAMPLE = "add_example",
  SIMPLIFY_LANGUAGE = "simplify_language",
  ADD_SOURCE_CITATION = "add_source_citation",
  CONSOLIDATE_CONTENT = "consolidate_content",
  RESTRUCTURE_HEADERS = "restructure_headers",
}

/**
 * KB update specification
 */
export interface KBUpdate {
  documentId: string;
  updateType: KBUpdateType;
  targetSection?: string;
  newContent?: string;
  replacePattern?: RegExp;
  replaceWith?: string;
  appendAfter?: string;
  prependBefore?: string;
  rationale: string;
}

/**
 * Generate KB updates from optimization recommendations
 */
function generateKBUpdates(
  recommendations: KBOptimizationRecommendation[]
): KBUpdate[] {
  const updates: KBUpdate[] = [];

  for (const rec of recommendations) {
    // Skip low-priority recommendations for now
    if (rec.priority === "low") continue;

    switch (rec.recommendationType) {
      case "update":
        // Low reference rate - need better structure
        updates.push({
          documentId: rec.documentId,
          updateType: KBUpdateType.RESTRUCTURE_HEADERS,
          rationale: rec.rationale,
        });
        break;

      case "expand":
        // High impact - add more examples
        updates.push({
          documentId: rec.documentId,
          updateType: KBUpdateType.ADD_EXAMPLE,
          rationale: rec.rationale,
        });
        break;

      case "consolidate":
        // Rarely used - consolidate content
        updates.push({
          documentId: rec.documentId,
          updateType: KBUpdateType.CONSOLIDATE_CONTENT,
          rationale: rec.rationale,
        });
        break;
    }
  }

  return updates;
}

/**
 * Apply a single update to a KB document
 */
function applyKBUpdate(update: KBUpdate): boolean {
  const doc = MPA_KB_DOCUMENTS.find((d) => d.id === update.documentId);
  if (!doc) {
    console.error(`Document not found: ${update.documentId}`);
    return false;
  }

  const filePath = path.join(KB_BASE_PATH, doc.filename);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  switch (update.updateType) {
    case KBUpdateType.ADD_BENCHMARK:
      if (update.newContent && update.appendAfter) {
        const afterPattern = new RegExp(update.appendAfter, "i");
        const match = content.match(afterPattern);
        if (match) {
          content = content.replace(afterPattern, `${match[0]}\n\n${update.newContent}`);
          modified = true;
        }
      }
      break;

    case KBUpdateType.CLARIFY_SECTION:
      if (update.replacePattern && update.replaceWith) {
        content = content.replace(update.replacePattern, update.replaceWith);
        modified = true;
      }
      break;

    case KBUpdateType.ADD_EXAMPLE:
      // Add example section if not present
      if (!content.includes("EXAMPLES:") && !content.includes("Example:")) {
        // Find appropriate place to add examples (before closing section)
        const exampleSection = `
EXAMPLES:

[Example content should be added based on high-impact sections]

`;
        // Append to end for now
        content += exampleSection;
        modified = true;
      }
      break;

    case KBUpdateType.RESTRUCTURE_HEADERS:
      // Ensure consistent header formatting
      // Convert various header styles to consistent format
      content = content
        .replace(/^([A-Z][A-Z\s]+)$/gm, "\n$1\n")
        .replace(/^\s*#\s*(.+)$/gm, "$1")
        .replace(/\n{3,}/g, "\n\n");
      modified = true;
      break;

    case KBUpdateType.ADD_SOURCE_CITATION:
      // Add source citation template if not present
      if (!content.includes("SOURCE:") && !content.includes("Based on:")) {
        const citationNote = `
NOTE: All benchmarks and data points should be cited with source.
Format: [DATA POINT] (Source: [SOURCE NAME], [DATE])

`;
        content = citationNote + content;
        modified = true;
      }
      break;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${doc.filename}`);
    return true;
  }

  console.log(`⏭️  No changes needed: ${doc.filename}`);
  return false;
}

/**
 * Apply all KB updates
 */
function applyAllKBUpdates(updates: KBUpdate[]): {
  applied: string[];
  skipped: string[];
  failed: string[];
} {
  const applied: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  for (const update of updates) {
    try {
      const success = applyKBUpdate(update);
      if (success) {
        applied.push(update.documentId);
      } else {
        skipped.push(update.documentId);
      }
    } catch (error) {
      console.error(`Failed to apply update to ${update.documentId}:`, error);
      failed.push(update.documentId);
    }
  }

  return { applied, skipped, failed };
}

// =============================================================================
// SHAREPOINT UPLOAD
// =============================================================================

/**
 * Upload KB documents to SharePoint
 *
 * Uses the existing upload script in the scripts directory
 */
async function uploadToSharePoint(documentIds?: string[]): Promise<{
  uploaded: string[];
  failed: string[];
}> {
  const uploaded: string[] = [];
  const failed: string[] = [];

  // Validate SharePoint configuration
  if (!SHAREPOINT_CONFIG.siteUrl || !SHAREPOINT_CONFIG.clientId) {
    console.error("SharePoint configuration missing. Set environment variables:");
    console.error("  SHAREPOINT_SITE_URL, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET, SHAREPOINT_TENANT_ID");
    return { uploaded, failed: documentIds || MPA_KB_DOCUMENTS.map((d) => d.id) };
  }

  const docsToUpload = documentIds
    ? MPA_KB_DOCUMENTS.filter((d) => documentIds.includes(d.id))
    : MPA_KB_DOCUMENTS;

  for (const doc of docsToUpload) {
    const filePath = path.join(KB_BASE_PATH, doc.filename);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      failed.push(doc.id);
      continue;
    }

    try {
      // Use the existing Python upload script
      const scriptPath = path.join(__dirname, "..", "..", "..", "..", "..", "scripts", "upload_kb_to_library.py");

      if (fs.existsSync(scriptPath)) {
        execSync(
          `python "${scriptPath}" --file "${filePath}" --library "${SHAREPOINT_CONFIG.libraryName}"`,
          {
            env: {
              ...process.env,
              SHAREPOINT_SITE_URL: SHAREPOINT_CONFIG.siteUrl,
              SHAREPOINT_CLIENT_ID: SHAREPOINT_CONFIG.clientId,
              SHAREPOINT_CLIENT_SECRET: SHAREPOINT_CONFIG.clientSecret,
              SHAREPOINT_TENANT_ID: SHAREPOINT_CONFIG.tenantId,
            },
          }
        );
        console.log(`✅ Uploaded to SharePoint: ${doc.filename}`);
        uploaded.push(doc.id);
      } else {
        console.warn(`Upload script not found: ${scriptPath}`);
        console.log(`📁 Manual upload required for: ${doc.filename}`);
        failed.push(doc.id);
      }
    } catch (error) {
      console.error(`Failed to upload ${doc.filename}:`, error);
      failed.push(doc.id);
    }
  }

  return { uploaded, failed };
}

// =============================================================================
// PIPELINE ORCHESTRATION
// =============================================================================

/**
 * Pipeline arguments
 */
interface PipelineArgs {
  analyze: boolean;
  apply: boolean;
  upload: boolean;
  reEvaluate: boolean;
  fullPipeline: boolean;
  promptVersion: string;
  impactDataPath?: string;
}

/**
 * Parse pipeline arguments
 */
function parsePipelineArgs(): PipelineArgs {
  const args = process.argv.slice(2);
  const result: PipelineArgs = {
    analyze: false,
    apply: false,
    upload: false,
    reEvaluate: false,
    fullPipeline: false,
    promptVersion: "v5_7_5",
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--analyze":
        result.analyze = true;
        break;
      case "--apply":
        result.apply = true;
        break;
      case "--upload":
        result.upload = true;
        break;
      case "--re-evaluate":
        result.reEvaluate = true;
        break;
      case "--full-pipeline":
        result.fullPipeline = true;
        break;
      case "--prompt-version":
      case "-p":
        result.promptVersion = args[++i];
        break;
      case "--impact-data":
        result.impactDataPath = args[++i];
        break;
    }
  }

  return result;
}

/**
 * Load KB impact data from file
 */
function loadKBImpactData(filePath: string): KBImpactMetrics[] | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    return data.metrics || null;
  } catch (error) {
    console.error(`Failed to load impact data from ${filePath}:`, error);
    return null;
  }
}

/**
 * Run the KB update pipeline
 */
async function runPipeline() {
  const args = parsePipelineArgs();

  console.log("\n" + "═".repeat(80));
  console.log("KB DOCUMENT UPDATE PIPELINE");
  console.log("═".repeat(80));
  console.log(`Prompt Version: ${args.promptVersion}`);
  console.log(`Mode: ${args.fullPipeline ? "Full Pipeline" : [
    args.analyze && "Analyze",
    args.apply && "Apply",
    args.upload && "Upload",
    args.reEvaluate && "Re-evaluate",
  ].filter(Boolean).join(" + ") || "Analyze only"}`);
  console.log("");

  // Create baseline before changes
  console.log("📸 Creating KB baseline snapshot...");
  const beforeBaseline = createKBBaseline(args.promptVersion);
  const beforePath = saveKBBaseline(beforeBaseline, "before");

  // Stage 1: Load impact data and generate recommendations
  console.log("\n" + "─".repeat(80));
  console.log("STAGE 1: ANALYZE KB IMPACT");
  console.log("─".repeat(80));

  let impactMetrics: KBImpactMetrics[] | null = null;

  if (args.impactDataPath) {
    impactMetrics = loadKBImpactData(args.impactDataPath);
  } else {
    // Look for most recent impact data
    const kbImpactDir = path.join(__dirname, "kb-impact");
    if (fs.existsSync(kbImpactDir)) {
      const files = fs.readdirSync(kbImpactDir)
        .filter((f) => f.startsWith("impact-") && f.endsWith(".json"))
        .sort()
        .reverse();

      if (files.length > 0) {
        const latestFile = path.join(kbImpactDir, files[0]);
        console.log(`Loading latest impact data: ${latestFile}`);
        impactMetrics = loadKBImpactData(latestFile);
      }
    }
  }

  if (!impactMetrics) {
    console.log("⚠️  No KB impact data found. Run evaluation with --track-kb first.");
    console.log("   Example: node dist/mpa-multi-turn-eval.js --track-kb");
    return;
  }

  const recommendations = generateKBOptimizationRecommendations(impactMetrics);
  const report = generateKBImpactReport(impactMetrics, recommendations);

  console.log(report);

  // Stage 2: Generate and optionally apply updates
  if (args.apply || args.fullPipeline) {
    console.log("\n" + "─".repeat(80));
    console.log("STAGE 2: APPLY KB UPDATES");
    console.log("─".repeat(80));

    const updates = generateKBUpdates(recommendations);
    console.log(`Generated ${updates.length} update(s)`);

    if (updates.length > 0) {
      const { applied, skipped, failed } = applyAllKBUpdates(updates);

      console.log(`\nResults:`);
      console.log(`  Applied: ${applied.length}`);
      console.log(`  Skipped: ${skipped.length}`);
      console.log(`  Failed: ${failed.length}`);

      // Create after baseline
      const afterBaseline = createKBBaseline(args.promptVersion);
      const afterPath = saveKBBaseline(afterBaseline, "after");

      // Compare baselines
      const comparison = compareKBBaselines(beforeBaseline, afterBaseline);
      console.log(`\nChanges detected:`);
      console.log(`  Modified: ${comparison.changed.length}`);
      console.log(`  Added: ${comparison.added.length}`);
      console.log(`  Removed: ${comparison.removed.length}`);
      console.log(`  Unchanged: ${comparison.unchanged.length}`);
    } else {
      console.log("No updates to apply based on current recommendations.");
    }
  }

  // Stage 3: Upload to SharePoint
  if (args.upload || args.fullPipeline) {
    console.log("\n" + "─".repeat(80));
    console.log("STAGE 3: UPLOAD TO SHAREPOINT");
    console.log("─".repeat(80));

    const { uploaded, failed } = await uploadToSharePoint();

    console.log(`\nResults:`);
    console.log(`  Uploaded: ${uploaded.length}`);
    console.log(`  Failed: ${failed.length}`);
  }

  // Stage 4: Re-evaluate
  if (args.reEvaluate || args.fullPipeline) {
    console.log("\n" + "─".repeat(80));
    console.log("STAGE 4: RE-EVALUATE WITH UPDATED KB");
    console.log("─".repeat(80));

    console.log("Triggering evaluation...");
    try {
      execSync(
        `node dist/mpa-multi-turn-eval.js --efficiency --track-kb --prompt-version ${args.promptVersion}-kb-updated`,
        { stdio: "inherit" }
      );
    } catch (error) {
      console.error("Evaluation failed:", error);
    }
  }

  console.log("\n" + "═".repeat(80));
  console.log("PIPELINE COMPLETE");
  console.log("═".repeat(80));
}

// Run if executed directly
runPipeline().catch(console.error);

export {
  createKBBaseline,
  saveKBBaseline,
  loadLatestKBBaseline,
  compareKBBaselines,
  generateKBUpdates,
  applyKBUpdate,
  applyAllKBUpdates,
  uploadToSharePoint,
};
