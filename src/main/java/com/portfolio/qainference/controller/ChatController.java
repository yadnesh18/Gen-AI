package com.portfolio.qainference.controller;

import com.portfolio.qainference.dto.ChatRequest;
import com.portfolio.qainference.dto.ChatResponse;
import com.portfolio.qainference.service.AIChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Thin HTTP layer. Delegates all business logic to {@link AIChatService}.
 *
 * <p>This microservice does not perform RAG (retrieval, embeddings, vector
 * search, or chunking) &mdash; it expects the prompt to already be fully
 * composed by the caller.</p>
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "AI-based question answering (inference only, no RAG)")
public class ChatController {

    private final AIChatService aiChatService;

    @Operation(
            summary = "Generate an answer for a supplied prompt",
            description = "Accepts a fully-composed prompt (RAG already applied upstream) and returns the "
                    + "Gemma/Gemini-generated answer."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Answer generated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "502", description = "Upstream AI model call failed"),
            @ApiResponse(responseCode = "504", description = "Upstream AI model call timed out")
    })
    @PostMapping(
            value = "/chat",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        log.info("Received chat request. promptLength={}", request.getPrompt().length());

        String answer = aiChatService.generateAnswer(request.getPrompt());

        ChatResponse response = ChatResponse.builder()
                .response(answer)
                .build();

        return ResponseEntity.ok(response);
    }
}
