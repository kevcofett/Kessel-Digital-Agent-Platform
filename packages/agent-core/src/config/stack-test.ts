/**
 * Stack Test Utility
 * For testing and debugging stack configuration
 */

import { getStackToggle } from './stack-toggle.js';
import { getStackProviderFactory } from './stack-provider-factory.js';

/**
 * Test the stack toggle system
 */
export async function testStackToggle(): Promise<void> {
  console.log('=== Stack Toggle Test ===\n');

  const toggle = getStackToggle();

  // Print stack summary
  console.log(toggle.getStackSummary());

  console.log('\n--- Configuration ---\n');

  const config = toggle.loadConfig();
  console.log('Config Type:', config.type);

  if (config.type === 'claude') {
    console.log('LLM Model:', config.llm.model);
    console.log('Embedding Model:', config.embedding.model);
    console.log('Storage Path:', config.storage.basePath);
  } else {
    console.log('Azure OpenAI Endpoint:', config.azureOpenAI.endpoint);
    console.log('Azure OpenAI Deployment:', config.azureOpenAI.deploymentName);
    console.log('Dataverse URL:', config.dataverse.environmentUrl);
    console.log('SharePoint Site:', config.sharePoint.siteUrl);
  }

  console.log('\n--- Provider Test ---\n');

  try {
    const factory = getStackProviderFactory();

    console.log('Creating LLM provider...');
    const llm = await factory.getLLMProvider();
    console.log('LLM provider created:', llm.name);

    console.log('Creating embedding provider...');
    const embedding = await factory.getEmbeddingProvider();
    console.log('Embedding provider created:', embedding.providerId);

    console.log('Creating storage provider...');
    const storage = await factory.getStorageProvider();
    console.log('Storage provider created:', storage.name);

    console.log('\n✅ All providers created successfully');
  } catch (error) {
    console.error('\n❌ Provider creation failed:', error);
  }
}

/**
 * Print stack configuration summary
 */
export function printStackSummary(): void {
  const toggle = getStackToggle();
  console.log(toggle.getStackSummary());
}

/**
 * CLI entry point
 */
const isMainModule = process.argv[1]?.endsWith('stack-test.js') || process.argv[1]?.endsWith('stack-test.ts');
if (isMainModule) {
  testStackToggle().catch(console.error);
}
