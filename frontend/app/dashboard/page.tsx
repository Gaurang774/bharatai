"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { SensitiveWarning } from "@/components/chat/SensitiveWarning";
import { chatApi, documentApi } from "@/lib/api";
import { getUser, type UserPayload } from "@/lib/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface PendingOptions {
  language: string;
  file?: File;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const [pendingOptions, setPendingOptions] = useState<PendingOptions>({ language: "English" });
  const [flaggedKeywords, setFlaggedKeywords] = useState<string[]>([]);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/");
    } else {
      setUser(u);
    }
  }, [router]);

  const handleSendMessage = async (
    text: string,
    options: { language: string; file?: File } = { language: "English" },
    force: boolean = false
  ) => {
    if (!text.trim()) return;

    // Client-side sensitive keyword pre-check for UX (backend still validates)
    const sensitiveWords = ["nuclear", "classified", "top secret", "troop deployment", "raw data", "internal memo"];
    const foundKeywords = sensitiveWords.filter((word) =>
      text.toLowerCase().includes(word)
    );

    if (foundKeywords.length > 0 && !force) {
      setFlaggedKeywords(foundKeywords);
      setPendingMessage(text);
      setPendingOptions(options);
      setIsWarningOpen(true);
      return;
    }

    setIsLoading(true);

    // If a file is attached, upload it first (to the RAG knowledge base)
    if (options.file) {
      try {
        const formData = new FormData();
        formData.append("file", options.file);
        formData.append("ministry", user?.ministry || "General");
        await documentApi.upload(formData);
        toast.success(`📎 "${options.file.name}" indexed into knowledge base.`, { duration: 4000 });
      } catch (err: any) {
        // Non-fatal: let the message still go through
        toast.error(`File upload failed: ${err?.response?.data?.detail || "Unknown error"}`);
      }
    }

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);

    // Read persisted ministry from sidebar selection, fallback to JWT ministry
    const ministryContext =
      (typeof window !== "undefined" && localStorage.getItem("bharatai_selected_ministry")) ||
      user?.ministry ||
      "General";

    try {
      const res = await chatApi.sendMessage(text, {
        ministry_context: ministryContext,
        language: options.language,
      });

      if (!res.ok) throw new Error("Terminal connection failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);

        // Filter RAG metadata tokens
        if (chunk.includes("[RAG_META:")) continue;

        assistantContent += chunk;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: assistantContent },
        ]);
      }
    } catch (err) {
      toast.error("Security Interception Error: Failed to retrieve sovereign intelligence.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const confirmFlaggedMessage = () => {
    setIsWarningOpen(false);
    handleSendMessage(pendingMessage, pendingOptions, true);
    toast.error("⚠️ Interaction flagged and logged for security review.", { duration: 5000 });
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#080808]">
      <Sidebar />

      <main className="flex flex-1 flex-col pl-[260px] relative">
        <TopBar />

        <div className="flex flex-1 flex-col pt-[52px]">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSelectPrompt={(text) => handleSendMessage(text, { language: "English" })}
            userEmail={user.sub}
          />

          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>

        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-[#f59e0b]/[0.02] blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[20%] left-[5%] h-[200px] w-[200px] rounded-full bg-[#f59e0b]/[0.01] blur-[80px]" />
      </main>

      <SensitiveWarning
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        onConfirm={confirmFlaggedMessage}
        keywords={flaggedKeywords}
      />
    </div>
  );
}
