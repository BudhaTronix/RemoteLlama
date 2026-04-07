"use client";

import { useEffect, useRef, useState } from "react";

import { useAppState } from "@/components/providers/app-provider";
import { ChatMessageCard } from "@/components/chat/chat-message-card";

export function ChatMessageList() {
  const { activeSession } = useAppState();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [stickToBottom, setStickToBottom] = useState(true);
  const messages = activeSession?.messages ?? [];
  const messageCount = messages.length;
  const lastMessageContent = messages.at(-1)?.content ?? "";

  useEffect(() => {
    if (!stickToBottom || !scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lastMessageContent, messageCount, stickToBottom]);

  return (
    <div
      ref={scrollRef}
      onScroll={() => {
        if (!scrollRef.current) {
          return;
        }

        const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;
        setStickToBottom(scrollHeight - scrollTop - clientHeight < 120);
      }}
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 md:px-6"
    >
      {messages.map((message) => (
        <ChatMessageCard key={message.id} message={message} />
      ))}
    </div>
  );
}
