import { ChatPageClient } from "@/components/game/ChatPageClient";

export default function ChatPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 pb-8 pt-2">
      <header className="sr-only">
        <h1>A-Z Companion Chat</h1>
      </header>
      <ChatPageClient />
    </main>
  );
}
