package com.portfolio.qainference.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Inbound request payload. The prompt is expected to already contain any
 * RAG-retrieved context, composed by the calling microservice.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload containing the final prompt to send to the LLM")
public class ChatRequest {

    @NotBlank(message = "prompt must not be blank")
    @Size(max = 32000, message = "prompt must not exceed 32000 characters")
    @Schema(
            description = "Fully composed prompt (RAG context + question). This service performs no retrieval.",
            example = "Based on the portfolio context below, summarize the investment performance...",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String prompt;
}
