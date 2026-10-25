package com.portfolio.qainference.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Provides a bounded executor used solely to enforce a hard timeout around the
 * (blocking) call to the Google AI Studio model, since the Spring AI
 * {@code ChatClient} call itself is synchronous.
 */
@Configuration
public class ExecutorConfig {

    @Bean
    public ExecutorService aiCallExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
