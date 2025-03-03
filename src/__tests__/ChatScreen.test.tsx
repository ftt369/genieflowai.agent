import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ChatScreen from '../components/ChatScreen';
import { useModel } from '../hooks/useModel';

// Mock the useModel hook
vi.mock('../hooks/useModel', () => ({
  useModel: vi.fn(),
}));

describe('ChatScreen', () => {
  const mockGenerateChat = vi.fn();
  const mockClearStreamingContent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useModel as any).mockReturnValue({
      generateChat: mockGenerateChat,
      loading: false,
      error: null,
      streamingContent: '',
      clearStreamingContent: mockClearStreamingContent,
    });
  });

  it('renders the chat screen with input field', () => {
    render(<ChatScreen />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user input and submission', async () => {
    const user = userEvent.setup();
    render(<ChatScreen />);

    const input = screen.getByPlaceholderText('Type your message...');
    const submitButton = screen.getByRole('button');

    await user.type(input, 'Hello, AI!');
    expect(input).toHaveValue('Hello, AI!');

    await user.click(submitButton);

    expect(mockGenerateChat).toHaveBeenCalledWith(
      [{ role: 'user', content: 'Hello, AI!' }],
      true
    );
    expect(input).toHaveValue('');
  });

  it('displays loading state', () => {
    (useModel as any).mockReturnValue({
      generateChat: mockGenerateChat,
      loading: true,
      error: null,
      streamingContent: '',
      clearStreamingContent: mockClearStreamingContent,
    });

    render(<ChatScreen />);
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('displays error message', () => {
    (useModel as any).mockReturnValue({
      generateChat: mockGenerateChat,
      loading: false,
      error: 'Something went wrong',
      streamingContent: '',
      clearStreamingContent: mockClearStreamingContent,
    });

    render(<ChatScreen />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('displays streaming content', () => {
    (useModel as any).mockReturnValue({
      generateChat: mockGenerateChat,
      loading: true,
      error: null,
      streamingContent: 'AI is typing...',
      clearStreamingContent: mockClearStreamingContent,
    });

    render(<ChatScreen />);
    expect(screen.getByText('AI is typing...')).toBeInTheDocument();
  });

  it('handles Enter key submission', async () => {
    const user = userEvent.setup();
    render(<ChatScreen />);

    const input = screen.getByPlaceholderText('Type your message...');
    await user.type(input, 'Hello{Enter}');

    expect(mockGenerateChat).toHaveBeenCalledWith(
      [{ role: 'user', content: 'Hello' }],
      true
    );
  });

  it('prevents empty message submission', async () => {
    const user = userEvent.setup();
    render(<ChatScreen />);

    const submitButton = screen.getByRole('button');
    await user.click(submitButton);

    expect(mockGenerateChat).not.toHaveBeenCalled();
  });

  it('clears streaming content on new message', async () => {
    const user = userEvent.setup();
    render(<ChatScreen />);

    const input = screen.getByPlaceholderText('Type your message...');
    await user.type(input, 'Hello{Enter}');

    expect(mockClearStreamingContent).toHaveBeenCalled();
  });
}); 