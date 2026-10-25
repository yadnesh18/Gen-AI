package com.portfolio.qainference.exception;

/**
 * Thrown when the call to the Google AI Studio hosted model fails, times out,
 * or returns an unusable response. Kept as an unchecked exception so it can
 * propagate cleanly from the service layer to the {@code @RestControllerAdvice}.
 */
public class AIServiceException extends RuntimeException {

    public AIServiceException(String message) {
        super(message);
    }

    public AIServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
