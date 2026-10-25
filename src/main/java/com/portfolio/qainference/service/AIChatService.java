package com.portfolio.qainference.service;

/**
 * Business contract for generating an answer from the hosted Gemma model.
 * Contains no HTTP or controller concerns.
 */
public interface AIChatService {

    /**
     * Sends the given prompt (already enriched with RAG context by the caller)
     * to the hosted Gemma model and returns the generated text.
     *
     * @param prompt a non-blank prompt
     * @return the model-generated answer
     */
    String generateAnswer(String prompt);
}
