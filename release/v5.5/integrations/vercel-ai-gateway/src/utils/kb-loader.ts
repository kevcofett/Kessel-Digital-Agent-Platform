/**
 * Knowledge Base Loader
 *
 * Loads KB documents from SharePoint or local filesystem.
 * Implements caching and fallback mechanisms.
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  getSharePointConfig,
  getGraphAccessToken,
  extractSiteId,
  GRAPH_API_CONFIG,
  KB_FILE_MAPPINGS,
  KB_CACHE_CONFIG,
  MAX_KB_FILE_SIZE,
} from '../config/sharepoint.js';

/**
 * KB content cache entry
 */
interface CacheEntry {
  content: string;
  loadedAt: number;
  source: 'sharepoint' | 'local';
}

/**
 * In-memory cache for KB content
 */
const kbCache = new Map<string, CacheEntry>();

/**
 * Get the current directory for module resolution
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Clear expired cache entries
 */
function clearExpiredCache(): void {
  const now = Date.now();
  const expiryMs = KB_CACHE_CONFIG.ttlSeconds * 1000;

  for (const [key, entry] of kbCache.entries()) {
    if (now - entry.loadedAt > expiryMs) {
      kbCache.delete(key);
    }
  }

  while (kbCache.size > KB_CACHE_CONFIG.maxEntries) {
    const oldestKey = kbCache.keys().next().value;
    if (oldestKey) {
      kbCache.delete(oldestKey);
    }
  }
}

/**
 * Load KB content from SharePoint via Graph API
 */
async function loadFromSharePoint(
  agent: keyof typeof KB_FILE_MAPPINGS,
  fileKey: string
): Promise<string | null> {
  try {
    const config = getSharePointConfig();
    const accessToken = await getGraphAccessToken();
    const { hostname, sitePath } = extractSiteId(config.siteUrl);
    const library = config.kbLibraries[agent];
    const filename = KB_FILE_MAPPINGS[agent]?.[fileKey as keyof (typeof KB_FILE_MAPPINGS)[typeof agent]];

    if (!filename) {
      console.warn(`Unknown KB file key: ${agent}/${fileKey}`);
      return null;
    }

    const siteIdUrl = `${GRAPH_API_CONFIG.baseUrl}/sites/${hostname}:${sitePath}`;
    const siteResponse = await fetch(siteIdUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!siteResponse.ok) {
      console.warn(`Failed to get SharePoint site: ${siteResponse.statusText}`);
      return null;
    }

    const siteData = (await siteResponse.json()) as { id: string };
    const siteId = siteData.id;

    const driveUrl = `${GRAPH_API_CONFIG.baseUrl}/sites/${siteId}/drives`;
    const drivesResponse = await fetch(driveUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!drivesResponse.ok) {
      console.warn(`Failed to get drives: ${drivesResponse.statusText}`);
      return null;
    }

    const drivesData = (await drivesResponse.json()) as { value: Array<{ id: string; name: string }> };
    const drive = drivesData.value.find((d) => d.name === library);

    if (!drive) {
      console.warn(`KB library not found: ${library}`);
      return null;
    }

    const fileUrl = `${GRAPH_API_CONFIG.baseUrl}/drives/${drive.id}/root:/${filename}:/content`;
    const fileResponse = await fetch(fileUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!fileResponse.ok) {
      console.warn(`Failed to get KB file: ${fileResponse.statusText}`);
      return null;
    }

    const contentLength = fileResponse.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_KB_FILE_SIZE) {
      console.warn(`KB file too large: ${filename} (${contentLength} bytes)`);
      return null;
    }

    const content = await fileResponse.text();
    return content;
  } catch (error) {
    console.error('SharePoint KB load error:', error);
    return null;
  }
}

/**
 * Load KB content from local filesystem
 */
async function loadFromLocal(
  agent: keyof typeof KB_FILE_MAPPINGS,
  fileKey: string
): Promise<string | null> {
  try {
    const filename = KB_FILE_MAPPINGS[agent]?.[fileKey as keyof (typeof KB_FILE_MAPPINGS)[typeof agent]];

    if (!filename) {
      console.warn(`Unknown KB file key: ${agent}/${fileKey}`);
      return null;
    }

    const localPaths = [
      join(__dirname, '..', '..', '..', '..', 'agents', agent, 'base', 'kb', filename),
      join(__dirname, '..', '..', '..', 'agents', agent, 'base', 'kb', filename),
      join(process.cwd(), 'release', 'v5.5', 'agents', agent, 'base', 'kb', filename),
    ];

    for (const localPath of localPaths) {
      if (existsSync(localPath)) {
        const content = await readFile(localPath, 'utf-8');
        return content;
      }
    }

    console.warn(`Local KB file not found: ${filename}`);
    return null;
  } catch (error) {
    console.error('Local KB load error:', error);
    return null;
  }
}

/**
 * Get KB content with caching and fallback
 *
 * @param agent - Agent identifier (mpa, ca, eap)
 * @param fileKey - Logical file key (e.g., 'analytics-engine')
 * @returns KB content string or null if not found
 */
export async function getKBContent(
  agent: keyof typeof KB_FILE_MAPPINGS,
  fileKey: string
): Promise<string | null> {
  const cacheKey = `${agent}:${fileKey}`;

  if (KB_CACHE_CONFIG.enabled) {
    clearExpiredCache();

    const cached = kbCache.get(cacheKey);
    if (cached) {
      return cached.content;
    }
  }

  let content = await loadFromSharePoint(agent, fileKey);
  let source: 'sharepoint' | 'local' = 'sharepoint';

  if (!content) {
    content = await loadFromLocal(agent, fileKey);
    source = 'local';
  }

  if (content && KB_CACHE_CONFIG.enabled) {
    kbCache.set(cacheKey, {
      content,
      loadedAt: Date.now(),
      source,
    });
  }

  return content;
}

/**
 * Get KB content by full filename
 *
 * @param filename - Full filename (e.g., 'Analytics_Engine_v5_5.txt')
 * @param agent - Optional agent hint for search
 * @returns KB content string or null if not found
 */
export async function getKBContentByFilename(
  filename: string,
  agent?: keyof typeof KB_FILE_MAPPINGS
): Promise<string | null> {
  const agents = agent ? [agent] : (['mpa', 'ca', 'eap'] as const);

  for (const agentKey of agents) {
    const mappings = KB_FILE_MAPPINGS[agentKey];
    for (const [key, value] of Object.entries(mappings)) {
      if (value === filename) {
        return getKBContent(agentKey, key);
      }
    }
  }

  console.warn(`KB file not found in mappings: ${filename}`);
  return null;
}

/**
 * Preload commonly used KB files into cache
 */
export async function preloadKBFiles(
  agent: keyof typeof KB_FILE_MAPPINGS,
  fileKeys: string[]
): Promise<void> {
  await Promise.all(fileKeys.map((key) => getKBContent(agent, key)));
}

/**
 * Clear all KB cache entries
 */
export function clearKBCache(): void {
  kbCache.clear();
}

/**
 * Get KB cache statistics
 */
export function getKBCacheStats(): {
  size: number;
  entries: Array<{ key: string; source: 'sharepoint' | 'local'; age: number }>;
} {
  const now = Date.now();
  return {
    size: kbCache.size,
    entries: Array.from(kbCache.entries()).map(([key, entry]) => ({
      key,
      source: entry.source,
      age: Math.round((now - entry.loadedAt) / 1000),
    })),
  };
}

/**
 * Extract a section from KB content
 *
 * @param content - Full KB content
 * @param sectionHeader - Section header to extract (ALL-CAPS format)
 * @returns Section content or null if not found
 */
export function extractKBSection(content: string, sectionHeader: string): string | null {
  const headerPattern = new RegExp(`^${sectionHeader}\\s*$`, 'm');
  const separatorPattern = /^[=]+$/m;

  const headerMatch = content.match(headerPattern);
  if (!headerMatch || headerMatch.index === undefined) {
    return null;
  }

  const startIndex = headerMatch.index + headerMatch[0].length;
  const remainingContent = content.substring(startIndex);

  const nextHeaderMatch = remainingContent.match(/^\n[A-Z][A-Z\s]+\n[=]+/m);
  const endIndex = nextHeaderMatch?.index ?? remainingContent.length;

  const sectionContent = remainingContent.substring(0, endIndex).trim();

  const cleanContent = sectionContent.replace(separatorPattern, '').trim();

  return cleanContent || null;
}

/**
 * Truncate KB content to fit within token limits
 *
 * @param content - Full KB content
 * @param maxChars - Maximum character count (approximate token proxy)
 * @returns Truncated content with indicator
 */
export function truncateKBContent(content: string, maxChars: number): string {
  if (content.length <= maxChars) {
    return content;
  }

  const lastNewline = content.lastIndexOf('\n', maxChars - 50);
  const cutoff = lastNewline > maxChars * 0.8 ? lastNewline : maxChars - 50;

  return content.substring(0, cutoff) + '\n\n[Content truncated for length]';
}
