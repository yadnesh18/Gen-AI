package com.portfolio.qainference.service.impl;

import com.portfolio.qainference.config.AiProperties;
import com.portfolio.qainference.exception.AIServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import com.portfolio.qainference.service.AIChatService;

/**
 * Core business logic for AI-based question answering.
 *
 * <p>Responsibilities: validate the prompt, invoke the hosted Gemma model
 * through Spring AI's {@link ChatClient}, enforce a hard timeout, and surface
 * a clean domain response or exception. No HTTP/controller logic lives here.</p>
 */
@Slf4j
@Service
public class AIChatServiceImpl implements AIChatService {

    private final ChatClient chatClient;
    private final AiProperties aiProperties;
    private final ExecutorService aiCallExecutor;

    public AIChatServiceImpl(ChatClient.Builder chatClientBuilder,
                              AiProperties aiProperties,
                              ExecutorService aiCallExecutor) {
        this.chatClient = chatClientBuilder.build();
        this.aiProperties = aiProperties;
        this.aiCallExecutor = aiCallExecutor;
    }

    @Override
    public String generateAnswer(String prompt) {
        if (!StringUtils.hasText(prompt)) {
            // Defense in depth: controller-level @Valid should already catch this.
            throw new IllegalArgumentException("prompt must not be blank");
        }

        log.info("Dispatching prompt to Gemma model. promptLength={}", prompt.length());

        Callable<String> callTask = () -> chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();

        Future<String> future = aiCallExecutor.submit(callTask);

        try {
            String result = future.get(aiProperties.getTimeoutSeconds(), TimeUnit.SECONDS);

            if (!StringUtils.hasText(result)) {
                throw new AIServiceException("Model returned an empty response");
            }

            log.info("Received response from Gemma model. responseLength={}", result.length());
            return result;

        } catch (TimeoutException e) {
            future.cancel(true);
            log.error("Timed out waiting for Gemma model response after {}s", aiProperties.getTimeoutSeconds());
            throw new AIServiceException("Timed out waiting for the AI model to respond", e);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AIServiceException("AI model call was interrupted", e);

        } catch (AIServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while calling Gemma model", e);
            throw new AIServiceException("Failed to generate a response from the AI model", e);
        }
    }
}
