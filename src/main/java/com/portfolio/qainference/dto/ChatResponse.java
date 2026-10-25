package com.portfolio.qainference.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response payload returned to the calling microservice.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload containing the LLM-generated answer")
public class ChatResponse {

    @Schema(
            description = "Generated answer text from the Gemma/Gemini model",
            example = "The portfolio has generated a CAGR of..."
    )
    private String response;
}
