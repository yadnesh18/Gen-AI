package com.portfolio.qainference;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the stateless AI Q&amp;A inference microservice.
 *
 * <p>This service does NOT perform RAG (retrieval, embeddings, vector search,
 * or chunking). It only accepts an already-composed prompt and forwards it to
 * the hosted Gemma/Gemini model via Google AI Studio, returning the generated
 * answer as-is.</p>
 */
@SpringBootApplication
public class QaInferenceServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(QaInferenceServiceApplication.class, args);
    }
}
