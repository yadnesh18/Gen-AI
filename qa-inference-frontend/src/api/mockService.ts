import type { ChatResponse } from '../types/chat';

/**
 * Mock inference service used when the backend at localhost:8080 is not running.
 * Produces rich, realistic responses simulating Gemma / Spring AI chat inference.
 */
export async function mockChatInference(
  prompt: string,
  signal?: AbortSignal
): Promise<ChatResponse> {
  const trimmed = prompt.trim();

  // Test error trigger simulations for QA testing
  if (!trimmed || trimmed === 'trigger-400') {
    const error = new Error('Request validation failed: prompt must not be blank');
    (error as unknown as { status: number }).status = 400;
    throw error;
  }

  if (trimmed.includes('trigger-504')) {
    // Simulate gateway timeout
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const error = new Error('The AI model did not respond in time. Please retry.');
    (error as unknown as { status: number }).status = 504;
    throw error;
  }

  if (trimmed.includes('trigger-500')) {
    const error = new Error('An unexpected error occurred during model inference');
    (error as unknown as { status: number }).status = 500;
    throw error;
  }

  // Simulate network latency (800ms - 1200ms) with abort support
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => resolve(), 900);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Request was cancelled.', 'AbortError'));
      });
    }
  });

  // Extract question & context if present
  let contextSnippet = '';
  let questionSnippet = trimmed;

  if (trimmed.includes('Context:\n') && trimmed.includes('Question:\n')) {
    const parts = trimmed.split('Question:\n');
    contextSnippet = parts[0].replace('Context:\n', '').trim();
    questionSnippet = parts[1]?.trim() || trimmed;
  }

  // Generate intelligent mock response
  let responseText = '';

  if (contextSnippet) {
    responseText = `### Grounded Inference Response (Mock Mode)

Based on the provided context:
> *${contextSnippet.length > 160 ? contextSnippet.slice(0, 160) + '...' : contextSnippet}*

**Analysis & Answer:**
Regarding **"${questionSnippet}"**:
1. The contextual data indicates key relevant parameters for your inquiry.
2. Verified against the provided grounding material.
3. Summary findings are consistent with upstream knowledge.

\`\`\`json
{
  "status": "grounded_answer",
  "model": "gemma-3-27b-it (mock)",
  "contextIncluded": true
}
\`\`\`
*(Note: Real backend is currently offline. Running via QA Mock Inference Engine).*`;
  } else if (trimmed.toLowerCase().includes('hello') || trimmed.toLowerCase().includes('hi')) {
    responseText = `Hello! I am the **QA Inference Service** assistant (powered by Gemma inference).

You can ask me questions, provide custom RAG context using the **Context** toggle above, or have a multi-turn conversation.

*(Running in mock mode because \`qa-inference-service\` is not active on localhost:8080)*`;
  } else if (trimmed.toLowerCase().includes('code') || trimmed.toLowerCase().includes('function')) {
    responseText = `Here is an example code snippet answering your request:

\`\`\`typescript
// Example inference client call
async function queryInference(prompt: string) {
  const res = await fetch('/api/v1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  return res.json();
}
\`\`\`

You can integrate this directly with your upstream vector store or pipeline.`;
  } else {
    responseText = `**Response to:** "${questionSnippet.length > 80 ? questionSnippet.slice(0, 80) + '...' : questionSnippet}"

Here is the synthesized response from the model:
- **Inference Summary:** The prompt was evaluated successfully.
- **Key Takeaway:** Multi-turn conversational flow is maintained on the client side.

*(Running in mock mode because \`qa-inference-service\` backend is not reachable on localhost:8080)*`;
  }

  return { response: responseText };
}

export async function mockHealthCheck(): Promise<{ status: 'UP'; details: Record<string, unknown> }> {
  // Small simulated latency
  await new Promise((resolve) => setTimeout(resolve, 100));
  return {
    status: 'UP',
    details: {
      mode: 'mock',
      service: 'qa-inference-service (mocked)',
      reason: 'Backend at localhost:8080 is unreachable or Mock Mode is enabled',
    },
  };
}
