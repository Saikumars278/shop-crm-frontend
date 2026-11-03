"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiRotateCcw,
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiZap,
} from "react-icons/fi";

interface ActionLink {
  label: string;
  url: string;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  action_links?: ActionLink[];
  quick_suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "Today's Sales",
  "Low Stock Alert",
  "Top Products",
  "Daily Target",
  "Inventory Value",
  "AI Recommendations",
  "How to create a bill?",
];

const INITIAL_BOT_MESSAGE: Message = {
  id: "welcome-1",
  sender: "bot",
  text: "👋 **Hello! I'm your Shop CRM AI Assistant.**\n\nI can check live sales, product stock & prices, monitor your daily targets, and give you business recommendations.\n\nHow can I help you today?",
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  quick_suggestions: [
    "Today's Sales",
    "Low Stock Alert",
    "Top Products",
    "Daily Target",
  ],
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function Chatbot() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_BOT_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Don't render chatbot on login page
  if (pathname === "/login") {
    return null;
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: "usr-" + Date.now(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chatbot/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();

      const botMessage: Message = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: data.reply || "I received your message, but no reply was generated.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        action_links: data.action_links || [],
        quick_suggestions: data.quick_suggestions || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Connection error";
      const botError: Message = {
        id: "bot-err-" + Date.now(),
        sender: "bot",
        text: `⚠️ **Unable to connect to assistant backend.**\n\n*Error: ${errorMessage}*\nPlease ensure the Django backend server is running on \`http://127.0.0.1:8000\`.`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        quick_suggestions: ["Today's Sales", "Low Stock Alert"],
      };
      setMessages((prev) => [...prev, botError]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        ...INITIAL_BOT_MESSAGE,
        id: "welcome-" + Date.now(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedText = (rawText: string) => {
    // Process markdown line by line
    const lines = rawText.split("\n");
    return lines.map((line, idx) => {
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Format bold, currency, and code
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);

      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong
              key={pIdx}
              className="font-bold text-slate-900 dark:text-white"
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={pIdx}
              className="bg-slate-200 dark:bg-slate-700/60 px-1 py-0.5 rounded text-[11px] font-mono text-blue-600 dark:text-blue-400"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      // Bullets
      if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-blue-500 shrink-0 mt-0.5 text-xs">•</span>
            <span className="flex-1 leading-relaxed">{formattedLine}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="my-1 leading-relaxed">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <>
      {/* ─── FLOATING TOGGLE BUTTON (Bottom-Right) ─── */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Helper Tooltip Badge (Visible on desktop when closed) */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden md:flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Ask Shop AI
            </span>
          </button>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close AI Chatbot" : "Open AI Chatbot"}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 active:scale-95 ${
            isOpen
              ? "bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rotate-90"
              : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 hover:shadow-blue-500/40 hover:scale-110"
          }`}
        >
          {isOpen ? (
            <FiX size={22} className="transition-transform duration-200" />
          ) : (
            <>
              <FiMessageSquare size={24} />
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* ─── FLOATING CHAT WINDOW ─── */}
      {isOpen && (
        <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-[420px] max-w-[calc(100%-2rem)] z-50 h-[600px] max-h-[82vh] flex flex-col rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-blue-500/15 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="relative border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent px-5 py-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
                  <FiZap size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                      Shop AI Assistant
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400">
                      LIVE
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      CRM Copilot Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={handleClearChat}
                  title="Reset Conversation"
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <FiRotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Chat"
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Suggestions Banner */}
          <div className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-950/40 px-3 py-2 overflow-x-auto shrink-0 flex items-center gap-2 scrollbar-none">
            {DEFAULT_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                disabled={isLoading}
                onClick={() => handleSendMessage(sug)}
                className="whitespace-nowrap rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all shrink-0 active:scale-95"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`relative max-w-[86%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs"
                      : "bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/50 dark:border-slate-700/50"
                  }`}
                >
                  {/* Message Content */}
                  <div>{renderFormattedText(msg.text)}</div>

                  {/* Action Links Pill Buttons */}
                  {msg.action_links && msg.action_links.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-2">
                      {msg.action_links.map((link, lIdx) => (
                        <button
                          key={lIdx}
                          onClick={() => {
                            router.push(link.url);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2.5 py-1 text-[11px] shadow-sm transition active:scale-95"
                        >
                          <span>{link.label}</span>
                          <FiExternalLink size={12} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Copy Button for Bot Messages */}
                  {msg.sender === "bot" && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      title="Copy response"
                      className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    >
                      {copiedId === msg.id ? (
                        <FiCheck size={12} className="text-emerald-500" />
                      ) : (
                        <FiCopy size={12} />
                      )}
                    </button>
                  )}
                </div>

                {/* Message Timestamp */}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                  {msg.time}
                </span>

                {/* Dynamic Quick Suggestions for this message */}
                {msg.quick_suggestions &&
                  msg.quick_suggestions.length > 0 &&
                  msg === messages[messages.length - 1] && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                      {msg.quick_suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          disabled={isLoading}
                          onClick={() => handleSendMessage(sug)}
                          className="rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition active:scale-95"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-[10px] font-bold">
                  AI
                </div>
                <div className="rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-800 px-4 py-3 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" />
                    <span className="ml-2 text-[11px] text-slate-400 font-medium">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3 shrink-0">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 px-3.5 py-1.5 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                disabled={isLoading}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about sales, stock, prices, target..."
                className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white transition-all disabled:opacity-30 disabled:hover:scale-100 hover:scale-105 active:scale-95 shadow-sm"
              >
                <FiSend size={13} />
              </button>
            </div>
            <div className="flex items-center justify-between px-1.5 mt-1.5 text-[10px] text-slate-400">
              <span>Press Enter to send</span>
              <span className="text-blue-500 font-medium">Live CRM AI</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
