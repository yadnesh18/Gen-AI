import { describe, expect, it } from 'vitest';
import type { ChatMessage } from '../types/chat';
import { buildPrompt } from './promptBuilder';

describe('promptBuilder', () => {
  it('returns empty string if question is blank', () => {
    expect(buildPrompt([], '')).toBe('');
    expect(buildPrompt([], '   ')).toBe('');
  });

  it('builds single prompt when history is empty', () => {
    const prompt = buildPrompt([], 'What is Gemma?');
    expect(prompt).toBe('What is Gemma?');
  });

  it('applies RAG context format: Context:\\n{context}\\n\\nQuestion:\\n{question}', () => {
    const prompt = buildPrompt([], 'What is the revenue?', {
      context: 'Q3 revenue is $42M.',
      includeHistory: false,
    });

    expect(prompt).toBe('Context:\nQ3 revenue is $42M.\n\nQuestion:\nWhat is the revenue?');
  });

  it('formats prior turns as "User: ... / Assistant: ..." followed by "User: {question}" when includeHistory is true', () => {
    const history: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Hi there', timestamp: 100 },
      { id: '2', role: 'assistant', content: 'Hello! How can I help?', timestamp: 200 },
    ];

    const prompt = buildPrompt(history, 'Can you explain Spring AI?', {
      includeHistory: true,
      maxTurns: 6,
    });

    const expected =
      'User: Hi there\n\n' +
      'Assistant: Hello! How can I help?\n\n' +
      'User: Can you explain Spring AI?';

    expect(prompt).toBe(expected);
  });

  it('caps history turns to the last N turns (e.g. 2)', () => {
    const history: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Turn 1', timestamp: 100 },
      { id: '2', role: 'assistant', content: 'Ans 1', timestamp: 200 },
      { id: '3', role: 'user', content: 'Turn 2', timestamp: 300 },
      { id: '4', role: 'assistant', content: 'Ans 2', timestamp: 400 },
    ];

    const prompt = buildPrompt(history, 'Turn 3', {
      includeHistory: true,
      maxTurns: 2,
    });

    // Should only include Turn 2 and Ans 2
    const expected = 'User: Turn 2\n\nAssistant: Ans 2\n\nUser: Turn 3';
    expect(prompt).toBe(expected);
  });

  it('ignores previous messages when includeHistory is false', () => {
    const history: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Turn 1', timestamp: 100 },
      { id: '2', role: 'assistant', content: 'Ans 1', timestamp: 200 },
    ];

    const prompt = buildPrompt(history, 'Turn 2', {
      includeHistory: false,
    });

    expect(prompt).toBe('Turn 2');
  });

  it('filters out previous error turns from history', () => {
    const history: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Valid prompt', timestamp: 100 },
      { id: '2', role: 'assistant', content: '', isError: true, error: '504 Timeout', timestamp: 200 },
    ];

    const prompt = buildPrompt(history, 'Follow up', {
      includeHistory: true,
    });

    expect(prompt).toBe('User: Valid prompt\n\nUser: Follow up');
  });

  it('combines RAG context with multi-turn history cleanly', () => {
    const history: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Hello', timestamp: 100 },
      { id: '2', role: 'assistant', content: 'Hi there!', timestamp: 200 },
    ];

    const prompt = buildPrompt(history, 'What was the margin?', {
      context: 'Margin was 24%.',
      includeHistory: true,
    });

    const expected =
      'User: Hello\n\n' +
      'Assistant: Hi there!\n\n' +
      'User: Context:\nMargin was 24%.\n\nQuestion:\nWhat was the margin?';

    expect(prompt).toBe(expected);
  });
});
