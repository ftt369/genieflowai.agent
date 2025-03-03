import ChatScreen from './ChatScreen';

interface ChatInterfaceProps {
  threadId: string;
}

export default function ChatInterface({ threadId }: ChatInterfaceProps) {
  return (
    <div className="flex flex-col h-full">
      <ChatScreen />
    </div>
  );
} 