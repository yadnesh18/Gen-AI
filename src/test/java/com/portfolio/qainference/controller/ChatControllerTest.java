package com.portfolio.qainference.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.qainference.dto.ChatRequest;
import com.portfolio.qainference.exception.AIServiceException;
import com.portfolio.qainference.service.AIChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ChatController.class)
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AIChatService aiChatService;

    @Test
    void chat_returns200WithGeneratedAnswer_forValidPrompt() throws Exception {
        when(aiChatService.generateAnswer(anyString()))
                .thenReturn("The portfolio has generated a CAGR of 12%.");

        ChatRequest request = new ChatRequest("Summarize the portfolio performance");

        mockMvc.perform(post("/api/v1/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.response").value("The portfolio has generated a CAGR of 12%."));
    }

    @Test
    void chat_returns400_whenPromptIsBlank() throws Exception {
        ChatRequest request = new ChatRequest("   ");

        mockMvc.perform(post("/api/v1/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void chat_returns400_whenPromptIsMissing() throws Exception {
        mockMvc.perform(post("/api/v1/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void chat_returns502_whenAiServiceFails() throws Exception {
        when(aiChatService.generateAnswer(anyString()))
                .thenThrow(new AIServiceException("upstream failure"));

        ChatRequest request = new ChatRequest("Summarize the portfolio performance");

        mockMvc.perform(post("/api/v1/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadGateway());
    }
}
