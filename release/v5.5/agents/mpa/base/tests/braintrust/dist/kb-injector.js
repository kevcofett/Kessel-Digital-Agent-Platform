"use strict";
/**
 * KB Injector for Multi-Turn MPA Evaluation
 *
 * Simulates RAG by injecting relevant KB content at each step.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KBInjector = exports.KB_FILES_BY_STEP = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const KB_BASE_PATH = "/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/kb";
/**
 * KB file mapping by step
 */
exports.KB_FILES_BY_STEP = {
    1: ["MPA_Supporting_Instructions_v5_5.txt"],
    2: [
        "MPA_Supporting_Instructions_v5_5.txt",
        "MPA_Expert_Lens_Budget_Allocation_v5_5.txt",
    ],
    3: [
        "MPA_Expert_Lens_Audience_Strategy_v5_5.txt",
        "MPA_Implications_Audience_Targeting_v5_5.txt",
    ],
    4: ["MPA_Geography_DMA_Planning_v5_5.txt"],
    5: [
        "MPA_Expert_Lens_Budget_Allocation_v5_5.txt",
        "MPA_Implications_Budget_Decisions_v5_5.txt",
    ],
    6: ["MPA_Conversation_Examples_v5_5.txt"],
    7: [
        "MPA_Expert_Lens_Channel_Mix_v5_5.txt",
        "MPA_Implications_Channel_Shifts_v5_5.txt",
    ],
    8: [
        "MPA_Expert_Lens_Measurement_Attribution_v5_5.txt",
        "MPA_Implications_Measurement_Choices_v5_5.txt",
    ],
    9: ["MPA_Supporting_Instructions_v5_5.txt"],
    10: ["MPA_Supporting_Instructions_v5_5.txt"],
};
/**
 * KB files that are always included in every step
 */
const ALWAYS_INCLUDE_KB = [
    "MPA_Adaptive_Language_v5_5.txt", // Sophistication matching
    "MPA_Calculation_Display_v5_5.txt", // Visible math patterns
    "MPA_Step_Boundary_Guidance_v5_5.txt", // Step boundary and question discipline
];
/**
 * Maximum characters per KB file to include
 */
const MAX_KB_CHARS = 4000;
/**
 * KB Injector class
 */
class KBInjector {
    kbCache = new Map();
    basePath;
    constructor(basePath = KB_BASE_PATH) {
        this.basePath = basePath;
    }
    /**
     * Get KB content for a specific step
     */
    async getKBForStep(step, customKBMap) {
        const kbFiles = customKBMap?.[step] || exports.KB_FILES_BY_STEP[step] || [];
        const contents = [];
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
            if (ALWAYS_INCLUDE_KB.includes(fileName))
                continue;
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
    async getKBStringForStep(step, customKBMap) {
        const contents = await this.getKBForStep(step, customKBMap);
        return contents.join("\n\n");
    }
    /**
     * Load a KB file with caching
     */
    async loadKBFile(fileName) {
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
        }
        catch (error) {
            console.warn(`Failed to load KB file: ${fileName}`);
            return null;
        }
    }
    /**
     * Format KB content with header
     */
    formatKBContent(fileName, content) {
        const docName = fileName
            .replace(/_v5_5\.txt$/, "")
            .replace(/_/g, " ")
            .toUpperCase();
        return `[KNOWLEDGE BASE: ${docName}]\n\n${content}\n\n[END KB: ${docName}]`;
    }
    /**
     * Truncate content to max characters
     */
    truncateContent(content, maxChars) {
        if (content.length <= maxChars)
            return content;
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
    clearCache() {
        this.kbCache.clear();
    }
    /**
     * Preload all KB files into cache
     */
    async preloadAll() {
        const allFiles = new Set();
        // Collect all unique file names
        for (const alwaysFile of ALWAYS_INCLUDE_KB) {
            allFiles.add(alwaysFile);
        }
        for (const files of Object.values(exports.KB_FILES_BY_STEP)) {
            for (const file of files) {
                allFiles.add(file);
            }
        }
        // Load all files
        const loadPromises = Array.from(allFiles).map((file) => this.loadKBFile(file));
        await Promise.all(loadPromises);
        console.log(`Preloaded ${allFiles.size} KB files`);
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
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
    getKBFilesForStep(step) {
        return [...ALWAYS_INCLUDE_KB, ...(exports.KB_FILES_BY_STEP[step] || [])];
    }
}
exports.KBInjector = KBInjector;
exports.default = KBInjector;
//# sourceMappingURL=kb-injector.js.map