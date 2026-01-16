/**
 * KB Injector for Multi-Turn MPA Evaluation
 *
 * Simulates RAG by injecting relevant KB content at each step.
 * Updated to reference actual KB files that exist in the repository.
 */

import * as fs from "fs/promises";
import * as path from "path";

const KB_BASE_PATH =
  "/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/kb";

/**
 * KB file mapping by step - uses ACTUAL files that exist
 */
export const KB_FILES_BY_STEP: Record<number, string[]> = {
  1: [
    "Strategic_Wisdom_v5_5.txt",
    "MPA_Conversation_Examples_v5_5.txt",
  ],
  2: [
    "Analytics_Engine_v5_5.txt",
    "MPA_Expert_Lens_Budget_Allocation_v5_5.txt",
  ],
  3: [
    "MPA_Expert_Lens_Audience_Strategy_v5_5.txt",
    "MPA_Implications_Audience_Targeting_v5_5.txt",
  ],
  4: [
    "MPA_Implications_Audience_Targeting_v5_5.txt",
  ],
  5: [
    "MPA_Expert_Lens_Budget_Allocation_v5_5.txt",
    "MPA_Implications_Budget_Decisions_v5_5.txt",
  ],
  6: [
    "MPA_Conversation_Examples_v5_5.txt",
    "BRAND_PERFORMANCE_FRAMEWORK_v5_5.txt",
  ],
  7: [
    "MPA_Expert_Lens_Channel_Mix_v5_5.txt",
    "MPA_Implications_Channel_Shifts_v5_5.txt",
  ],
  8: [
    "MPA_Expert_Lens_Measurement_Attribution_v5_5.txt",
    "MPA_Implications_Measurement_Choices_v5_5.txt",
    "MEASUREMENT_FRAMEWORK_v5_5.txt",
  ],
  9: [
    "Gap_Detection_Playbook_v5_5.txt",
    "MPA_Implications_Timing_Pacing_v5_5.txt",
  ],
  10: [
    "Gap_Detection_Playbook_v5_5.txt",
    "Confidence_Level_Framework_v5_5.txt",
  ],
};

/**
 * KB files that are always included in every step
 * These files MUST exist in the kb directory
 */
const ALWAYS_INCLUDE_KB = [
  "KB_00_Agent_Core_Operating_Standards.txt",
  "Data_Provenance_Framework_v5_5.txt",
  "MPA_Supporting_Instructions_v5_5.txt",
];

/**
 * Maximum characters per KB file to include
 */
const MAX_KB_CHARS = 4000;

/**
 * KB Injector class
 */
export class KBInjector {
  private kbCache: Map<string, string> = new Map();
  private basePath: string;

  constructor(basePath: string = KB_BASE_PATH) {
    this.basePath = basePath;
  }

  /**
   * Get KB content for a specific step
   */
  async getKBForStep(
    step: number,
    customKBMap?: Record<number, string[]>
  ): Promise<string[]> {
    const kbFiles = customKBMap?.[step] || KB_FILES_BY_STEP[step] || [];
    const contents: string[] = [];

    // Always include required KB files
    for (const alwaysFile of ALWAYS_INCLUDE_KB) {
      const content = await this.loadKBFile(alwaysFile);
      if (content) {
        contents.push(this.formatKBContent(alwaysFile, content));
      }
    }

    // Load step-specific KB files
    for (const fileName of kbFiles) {
      // Avoid duplicating always-included KB files
      if (ALWAYS_INCLUDE_KB.includes(fileName)) continue;

      const content = await this.loadKBFile(fileName);
      if (content) {
        contents.push(this.formatKBContent(fileName, content));
      }
    }

    return contents;
  }

  /**
   * Get KB content as a single concatenated string
   */
  async getKBStringForStep(
    step: number,
    customKBMap?: Record<number, string[]>
  ): Promise<string> {
    const contents = await this.getKBForStep(step, customKBMap);
    return contents.join("\n\n");
  }

  /**
   * Load a KB file with caching
   */
  private async loadKBFile(fileName: string): Promise<string | null> {
    // Check cache
    if (this.kbCache.has(fileName)) {
      return this.kbCache.get(fileName) || null;
    }

    try {
      const filePath = path.join(this.basePath, fileName);
      const content = await fs.readFile(filePath, "utf-8");

      // Truncate to reasonable size for context
      const truncated = this.truncateContent(content, MAX_KB_CHARS);

      this.kbCache.set(fileName, truncated);
      return truncated;
    } catch (error) {
      console.warn(`Failed to load KB file: ${fileName}`);
      return null;
    }
  }

  /**
   * Format KB content with header
   */
  private formatKBContent(fileName: string, content: string): string {
    const docName = fileName
      .replace(/_v5_5\.txt$/, "")
      .replace(/\.txt$/, "")
      .replace(/_/g, " ")
      .toUpperCase();
    return `[KNOWLEDGE BASE: ${docName}]\n\n${content}\n\n[END KB: ${docName}]`;
  }

  /**
   * Truncate content to max characters
   */
  private truncateContent(content: string, maxChars: number): string {
    if (content.length <= maxChars) return content;

    // Try to truncate at a section boundary
    const truncated = content.slice(0, maxChars);
    const lastSection = truncated.lastIndexOf("===");
    const lastParagraph = truncated.lastIndexOf("\n\n");

    // Prefer section boundary, then paragraph boundary
    if (lastSection > maxChars * 0.7) {
      return truncated.slice(0, lastSection).trim() + "\n[...TRUNCATED]";
    }

    if (lastParagraph > maxChars * 0.8) {
      return truncated.slice(0, lastParagraph).trim() + "\n[...TRUNCATED]";
    }

    return truncated.trim() + "\n[...TRUNCATED]";
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.kbCache.clear();
  }

  /**
   * Preload all KB files into cache
   */
  async preloadAll(): Promise<void> {
    const allFiles = new Set<string>();

    // Collect all unique file names
    for (const alwaysFile of ALWAYS_INCLUDE_KB) {
      allFiles.add(alwaysFile);
    }
    for (const files of Object.values(KB_FILES_BY_STEP)) {
      for (const file of files) {
        allFiles.add(file);
      }
    }

    // Load all files
    const loadPromises = Array.from(allFiles).map((file) =>
      this.loadKBFile(file)
    );
    await Promise.all(loadPromises);

    console.log(`Preloaded ${allFiles.size} KB files`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { cachedFiles: number; totalChars: number } {
    let totalChars = 0;
    for (const content of this.kbCache.values()) {
      totalChars += content.length;
    }
    return {
      cachedFiles: this.kbCache.size,
      totalChars,
    };
  }

  /**
   * Get list of KB files for a step
   */
  getKBFilesForStep(step: number): string[] {
    return [...ALWAYS_INCLUDE_KB, ...(KB_FILES_BY_STEP[step] || [])];
  }
}

export default KBInjector;
