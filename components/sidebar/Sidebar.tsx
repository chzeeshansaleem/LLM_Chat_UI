// components/Sidebar.tsx
"use client";

import { Clock, Heart, HelpCircle, X, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction, useState } from "react";
import { deleteChatApi, updateChatTitleApi } from "@/app/services/chatsApi";

type TabType = "history" | "favorites" | "support";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
}

interface Thread {
  threadId: string; // updated from threadId
  title: string;
  messages: ChatMessage[];
}

interface SidebarProps {
  selectedTab: "history" | "favorites" | "support";
  setSelectedTab: (tab: "history" | "favorites" | "support") => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedThread: Thread | null;
  chatHistory: Thread[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>; // ✅ fixed type
  setCurrentChatId: (id: string) => void;
  onDeleteSuccess: () => void;
}

export default function Sidebar({
  selectedTab,
  setSelectedTab,
  sidebarOpen,
  setSidebarOpen,
  selectedThread,
  chatHistory,
  setMessages,
  setCurrentChatId,
  onDeleteSuccess,
}: SidebarProps) {
  const handleThreadClick = (chatId: string) => {
    setCurrentChatId(chatId);
    const selectedThread = chatHistory.find(
      (thread) => thread.threadId === chatId
    );
    if (selectedThread) {
      setMessages(selectedThread.messages);
    }
  };
  // Track which thread is in edit mode (threadId or null)
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  // Track edited title input value
  const [editedTitle, setEditedTitle] = useState("");
  // Callbacks for editing title
  const startEditing = (threadId: string, currentTitle: string) => {
    setEditingThreadId(threadId);
    setEditedTitle(currentTitle);
  };

  const cancelEditing = () => {
    setEditingThreadId(null);
    setEditedTitle("");
  };

  const saveEditing = async (threadId: string) => {
    try {
      await updateChatTitleApi(threadId, editedTitle);

      // Optional: update local UI
      const threadIndex = chatHistory.findIndex((t) => t.threadId === threadId);
      if (threadIndex !== -1) {
        chatHistory[threadIndex].title = editedTitle;
      }

      setEditingThreadId(null);
      setEditedTitle("");
    } catch (err) {
      console.error("Error updating title:", err);
    }
  };

  const handleDelete = async (threadId: string) => {
    try {
      await deleteChatApi(threadId);

      if (selectedThread?.threadId === threadId) {
        setMessages([]);
        setCurrentChatId("");
      }

      // ✅ Trigger re-fetch in parent
      onDeleteSuccess();

      console.log("Chat deleted:", threadId);
    } catch (err) {
      console.error("Error deleting thread:", err);
    }
  };

  return (
    <>
      {/* Icon Bar */}
      <div className="w-14 border-r h-full flex flex-col items-center justify-start py-6 gap-6 fixed z-20 bg-[var(--fixed-sidebar-background)]">
        {/* Buttons for tabs (unchanged) */}
        <button
          onClick={() => {
            setSelectedTab("history");
            setSidebarOpen(true);
          }}
          className={cn(
            "p-2 rounded transition",
            selectedTab === "history" && sidebarOpen
              ? "text-[var(--custom-color-text)] bg-[var(--secondary)]"
              : "text-gray-500 hover:text-black"
          )}
        >
          <Clock size={22} />
        </button>
        <button
          onClick={() => {
            setSelectedTab("support");
            setSidebarOpen(true);
          }}
          className={cn(
            "p-2 rounded transition",
            selectedTab === "support" && sidebarOpen
              ? " text-[var(--custom-color-text)] bg-[var(--secondary)]"
              : "text-gray-500 hover:text-black"
          )}
        >
          <HelpCircle size={22} />
        </button>
        <button
          onClick={() => {
            setSelectedTab("favorites");
            setSidebarOpen(true);
          }}
          className={cn(
            "p-2 rounded transition",
            selectedTab === "favorites" && sidebarOpen
              ? "text-[var(--custom-color-text)] bg-[var(--secondary)]"
              : "text-gray-500 hover:text-black"
          )}
        >
          <Heart size={22} />
        </button>
      </div>

      {/* Sidebar Panel */}
      {sidebarOpen && (
        <div
          className={cn(
            "ml-14 fixed top-[58px] h-full z-40 w-64 bg-gray-50 border-r transition-all duration-300 flex flex-col sm:static sm:z-0 sm:h-auto sm:flex-shrink-0"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize text-[var(--color-heading)]">
                {selectedTab}
              </span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedTab === "history" && (
              <div className="p-4">
                {(() => {
                  const getThreadDate = (thread: Thread) => {
                    const lastMessage =
                      thread.messages[thread.messages.length - 1];
                    return new Date(
                      (lastMessage as any)?.timestamp || Date.now()
                    );
                  };

                  const today = new Date();
                  const yesterday = new Date();
                  yesterday.setDate(today.getDate() - 1);

                  const isSameDay = (d1: Date, d2: Date) =>
                    d1.getFullYear() === d2.getFullYear() &&
                    d1.getMonth() === d2.getMonth() &&
                    d1.getDate() === d2.getDate();

                  const grouped = {
                    today: [] as Thread[],
                    yesterday: [] as Thread[],
                    previous: [] as Thread[],
                  };

                  const sortedThreads = [...chatHistory].sort((a, b) => {
                    const dateA = getThreadDate(a).getTime();
                    const dateB = getThreadDate(b).getTime();
                    return dateB - dateA; // Most recent first
                  });

                  for (const thread of sortedThreads) {
                    const threadDate = getThreadDate(thread);
                    if (isSameDay(threadDate, today)) {
                      grouped.today.push(thread);
                    } else if (isSameDay(threadDate, yesterday)) {
                      grouped.yesterday.push(thread);
                    } else {
                      grouped.previous.push(thread);
                    }
                  }

                  const renderGroup = (label: string, threads: Thread[]) =>
                    threads.length > 0 && (
                      <div className="mb-4" key={label}>
                        <h3 className="text-sm font-medium text-[var(--color-text)] mb-2">
                          {label}
                        </h3>
                        <ul className="space-y-3">
                          {threads.map((thread) => (
                            <li
                              key={thread.threadId}
                              className={cn(
                                "text-sm text-[var(--color-text-list)] p-2 rounded cursor-pointer flex justify-between items-center hover:bg-gray-100",
                                selectedThread?.threadId === thread.threadId &&
                                  "bg-gray-100"
                              )}
                            >
                              <div
                                onClick={() => {
                                  if (editingThreadId === null) {
                                    handleThreadClick(thread.threadId);
                                  }
                                }}
                                className="flex-1 truncate"
                              >
                                {editingThreadId === thread.threadId ? (
                                  <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) =>
                                      setEditedTitle(e.target.value)
                                    }
                                    onBlur={() => saveEditing(thread.threadId)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        saveEditing(thread.threadId);
                                      }
                                      if (e.key === "Escape") {
                                        cancelEditing();
                                      }
                                    }}
                                    autoFocus
                                    className="w-full px-1 py-0.5 border border-gray-300 rounded"
                                  />
                                ) : (
                                  thread.title
                                )}
                              </div>

                              <div className="flex gap-2 ml-4">
                                {editingThreadId === thread.threadId ? (
                                  <button
                                    onClick={cancelEditing}
                                    title="Cancel"
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <X size={16} />
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() =>
                                        startEditing(
                                          thread.threadId,
                                          thread.title
                                        )
                                      }
                                      title="Edit"
                                      className="text-gray-500 hover:text-gray-700"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDelete(thread.threadId)
                                      }
                                      title="Delete"
                                      className="text-gray-500 hover:text-gray-700"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );

                  return (
                    <>
                      {renderGroup("Today", grouped.today)}
                      {renderGroup("Yesterday", grouped.yesterday)}
                      {renderGroup("Previous", grouped.previous)}
                    </>
                  );
                })()}
              </div>
            )}

            {selectedTab === "support" && (
              <div className="p-4 text-sm text-[var(--color-text-list)]">
                <p>Support-Inhalte erscheinen hier...</p>
              </div>
            )}

            {selectedTab === "favorites" && (
              <div className="p-4 text-sm text-[var(--color-text-list)]">
                <p>Deine Favoriten erscheinen hier...</p>
              </div>
            )}
          </div>

          <div className="hidden sm:block p-4 border-t h-[9.4vh] bg-[var(--footer-background)]">
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
              <HelpCircle size={18} />
              <span className="text-sm">helfen</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
