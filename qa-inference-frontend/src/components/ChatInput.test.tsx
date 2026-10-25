import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChatInput } from './ChatInput';

describe('ChatInput component', () => {
  it('renders input and disabled send button when empty', () => {
    render(
      <ChatInput
        onSendMessage={vi.fn()}
        isLoading={false}
        onCancelRequest={vi.fn()}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /Chat prompt message/i });
    expect(textarea).toBeInTheDocument();

    const sendButton = screen.getByRole('button', { name: /Send message/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when text is typed and calls onSendMessage on click', () => {
    const handleSend = vi.fn();
    render(
      <ChatInput
        onSendMessage={handleSend}
        isLoading={false}
        onCancelRequest={vi.fn()}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /Chat prompt message/i });
    fireEvent.change(textarea, { target: { value: 'How does inference work?' } });

    const sendButton = screen.getByRole('button', { name: /Send message/i });
    expect(sendButton).not.toBeDisabled();

    fireEvent.click(sendButton);
    expect(handleSend).toHaveBeenCalledWith('How does inference work?', '');
  });

  it('triggers send on Enter key without shift', () => {
    const handleSend = vi.fn();
    render(
      <ChatInput
        onSendMessage={handleSend}
        isLoading={false}
        onCancelRequest={vi.fn()}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /Chat prompt message/i });
    fireEvent.change(textarea, { target: { value: 'My prompt' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(handleSend).toHaveBeenCalledWith('My prompt', '');
  });

  it('does NOT trigger send on Shift+Enter', () => {
    const handleSend = vi.fn();
    render(
      <ChatInput
        onSendMessage={handleSend}
        isLoading={false}
        onCancelRequest={vi.fn()}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /Chat prompt message/i });
    fireEvent.change(textarea, { target: { value: 'My prompt' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('shows Cancel button when isLoading is true', () => {
    const handleCancel = vi.fn();
    render(
      <ChatInput
        onSendMessage={vi.fn()}
        isLoading={true}
        onCancelRequest={handleCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel request/i });
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    expect(handleCancel).toHaveBeenCalled();
  });
});
