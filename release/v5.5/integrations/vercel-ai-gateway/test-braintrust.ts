import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { wrapAnthropic, initLogger } from "braintrust";

// Initialize the Braintrust logger and wrap the Anthropic client
// wrapAnthropic() automatically captures all AI calls as traces
const client = wrapAnthropic(
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  }),
);
// You can also use logger.log() for custom traces
// (e.g., multimodal inputs, metadata)
const logger = initLogger({
  projectName: "My Project",
  apiKey: process.env.BRAINTRUST_API_KEY,
});

// Enter your prompt call here
async function main() {
  const result = await client.messages.create({
    messages: [
      {
        role: "user",
        content: "What is 1+1?",
      },
    ],
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
  });
  console.log(result);
}

main();
