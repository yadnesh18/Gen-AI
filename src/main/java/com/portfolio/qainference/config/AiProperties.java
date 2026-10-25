package com.portfolio.qainference.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Application-specific tuning knobs for the outbound call to the hosted model.
 * These are independent of Spring AI's own connection/read timeouts and are
 * used to bound how long the service layer waits before failing fast.
 *
 * <p>Configured via {@code app.ai.*} in application.yml.</p>
 */
@Configuration
@ConfigurationProperties(prefix = "app.ai")
@Data
public class AiProperties {

    /**
     * Max time (in seconds) the service will wait for a model response
     * before raising a timeout error to the caller.
     */
    private long timeoutSeconds = 30;
}
