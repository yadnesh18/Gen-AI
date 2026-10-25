package com.portfolio.qainference.service;

import com.portfolio.qainference.config.AiProperties;
import com.portfolio.qainference.exception.AIServiceException;
import com.portfolio.qainference.service.impl.AIChatServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.ChatClient.ChatClientRequestSpec;
import org.springframework.ai.chat.client.ChatClient.CallResponseSpec;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AIChatServiceImplTest {

    @Mock
    private ChatClient.Builder chatClientBuilder;

    @Mock
    private ChatClient chatClient;

    @Mock
    private ChatClientRequestSpec requestSpec;

    @Mock
    private CallResponseSpec callResponseSpec;

    private AIChatServiceImpl aiChatService;
    private ExecutorService executorService;

    @BeforeEach
    void setUp() {
        when(chatClientBuilder.build()).thenReturn(chatClient);
        executorService = Executors.newVirtualThreadPerTaskExecutor();

        AiProperties aiProperties = new AiProperties();
        aiProperties.setTimeoutSeconds(5);

        aiChatService = new AIChatServiceImpl(chatClientBuilder, aiProperties, executorService);
    }

    @Test
    void generateAnswer_returnsModelResponse_whenCallSucceeds() {
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callResponseSpec);
        when(callResponseSpec.content()).thenReturn("The portfolio has generated a CAGR of 12%.");

        String result = aiChatService.generateAnswer("Summarize the portfolio performance");

        assertThat(result).isEqualTo("The portfolio has generated a CAGR of 12%.");
    }

    @Test
    void generateAnswer_throwsAIServiceException_whenModelReturnsEmptyResponse() {
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callResponseSpec);
        when(callResponseSpec.content()).thenReturn("   ");

        assertThatThrownBy(() -> aiChatService.generateAnswer("some prompt"))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("empty response");
    }

    @Test
    void generateAnswer_throwsAIServiceException_whenUnderlyingCallThrows() {
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenThrow(new RuntimeException("upstream failure"));

        assertThatThrownBy(() -> aiChatService.generateAnswer("some prompt"))
                .isInstanceOf(AIServiceException.class);
    }

    @Test
    void generateAnswer_throwsIllegalArgumentException_whenPromptIsBlank() {
        assertThatThrownBy(() -> aiChatService.generateAnswer("   "))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
