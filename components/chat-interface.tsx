"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import Header from "./header/Header";
import { Button } from "@/components/ui/button";
import Sidebar from "./sidebar/Sidebar";
import { Textarea } from "./ui/textarea";
import Footer from "./footer/Footer";
import ChatMessage from "./chatMessage/ChatMessage";
import { COMPANY_INFO } from "@/lib/constant";
import {
  fetchAllChatsMe,
} from "@/lib/api/chatService";
import {
  fetchMessagesByChatIdApi,
  saveAssistantResponseApi,
  sendUserMessageApi,
} from "@/app/services/messages";
import { createNewChatApi } from "@/app/services/chatsApi";
interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
}

interface ChatThread {
  threadId: string;
  title: string;
  messages: ChatMessage[];
}

type ChatHistory = ChatThread[];

type TabType = "history" | "favorites" | "support";

export default function ChatInterface() {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [selectedTab, setSelectedTab] = useState<TabType>("history");
  const [input, setInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatThread[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const topics = [
    "Shortlink zu Thema 1",
    "Shortlink zu Thema 2",
    "Shor ef ema 3",
    "Serrgr 4",
    "more",
  ];

  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [topicsList, setTopicsList] = useState(topics);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleTopicClick = (clickedTopic: string) => {
    setInput((prev) => (prev ? `${prev} ${clickedTopic}` : clickedTopic));
    setTopicsList((prev) => prev.filter((topic) => topic !== clickedTopic));
  };
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    try {
      //  Send user message to your chat API
      await sendUserMessageApi(
        userMessage.text,
        selectedModel,
        Number(currentChatId)
      );

      const fileIds =
        uploadedFiles.length > 0
          ? await uploadFilesToOpenAI(uploadedFiles)
          : [];

      const res = await fetch("/api/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: newMessages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
          fileIds,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Failed to fetch stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let botMessage: ChatMessage = {
        id: Date.now().toString() + "_bot",
        text: "",
        sender: "bot",
      };

      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                botMessage.text += delta;
                setMessages((prev) => {
                  const newMsg = [...prev];
                  newMsg[newMsg.length - 1] = { ...botMessage }; // update latest bot message
                  return newMsg;
                });
              }
            } catch (err) {
              console.error("Error parsing stream chunk:", err);
            }
          }
        }
      }
      await saveAssistantResponseApi(
        botMessage.text,
        selectedModel,
        Number(currentChatId)
      );
      // Finalize chat history
      const updatedHistory = [...chatHistory];
      if (currentChatId) {
        const threadIndex = updatedHistory.findIndex(
          (t) => t.threadId === currentChatId
        );
        if (threadIndex !== -1) {
          updatedHistory[threadIndex].messages = [...newMessages, botMessage];
        }
      } else {
        const newThreadId = Date.now().toString();
        const newThread = {
          threadId: newThreadId,
          title: `Chat Thread ${updatedHistory.length + 1}`,
          messages: [...newMessages, botMessage],
        };
        updatedHistory.push(newThread);
        setCurrentChatId(newThreadId);
      }

      setChatHistory(updatedHistory);
      setUploadedFiles([]);
    } catch (error) {
      console.error("API error:", error);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessagesByChatId = async (
    chatId: string
  ): Promise<ChatMessage[]> => {
    try {
      const data: any = await fetchMessagesByChatIdApi(chatId);
      // Map server messages to ChatMessage type
      const mappedMessages: ChatMessage[] = data.map((msg: any) => ({
        id: msg.id.toString(),
        text: msg.content,
        sender: msg.role === "user" ? "user" : "assistant",
      }));

      return mappedMessages;
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      return [];
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentChatId) return;

      const fetchedMessages = await fetchMessagesByChatId(currentChatId);
      setMessages(fetchedMessages);
    };

    loadMessages();
  }, [currentChatId]);

  const postData = async (title: string, model_used: string) => {
    try {
      const result = await createNewChatApi(title, model_used);
      return result; // ✅ return the result so it can be used
    } catch (error) {
      console.error("Error posting chat data:", error);
      throw error;
    }
  };

  const initializeChats = async () => {
    try {
      const allChats = await fetchAllChatsMe();

      setChatHistory(
        allChats.map((c: { id: { toString: () => any }; title: any }) => ({
          threadId: c.id.toString(),
          title: c.title,
          messages: [],
        }))
      );

      if (allChats.length > 0) {
        const latestChat = allChats[allChats.length - 1];
        setCurrentChatId(latestChat.id.toString());
      }
    } catch (err) {
      console.error("Failed to load chats from DB:", err);
    }
  };
  useEffect(() => {
    initializeChats();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const selectedThread =
    chatHistory.find((thread) => thread.threadId === currentChatId) ?? null;

  const handleNewChat = async () => {
    try {
      const newThreadId = Date.now().toString();
      const title = `Chat Thread ${newThreadId}`;
      const model_used = selectedModel;

      // 1. Create new chat on backend
      const newChat = await postData(title, model_used);

      // 2. Create new chat thread locally
      const newThread = {
        threadId: newChat.id.toString(), // Make sure it matches backend id
        title: newChat.title,
        messages: [],
      };

      console.log("Creating new chat...");

      // 3. Update local state
      setChatHistory((prevHistory) => [...prevHistory, newThread]);
      setCurrentChatId(newThread.threadId);
      setMessages([]);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const uploadFilesToOpenAI = async (files: File[]) => {
    const fileIds = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "assistants");

      const res = await fetch("https://api.openai.com/v1/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Organization": process.env.OPENAI_ORGANIZATION!,
        },
        body: formData,
      });

      const json = await res.json();
      if (json.id) fileIds.push(json.id);
    }

    return fileIds;
  };
  const fetchChats = async () => {
    initializeChats();
  };
  return (
    <div className="flex flex-col h-screen">
      <Header
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        handleNewChat={handleNewChat}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          selectedThread={selectedThread}
          chatHistory={chatHistory}
          setMessages={setMessages}
          setCurrentChatId={setCurrentChatId}
          onDeleteSuccess={fetchChats}
        />

        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
          <div
            className={`flex-1 overflow-y-auto p-6 flex flex-col items-center ${
              messages.length > 0 ? "justify-end" : "justify-center"
            } ml-14 transition-all duration-300`}
          >
            <div className="w-full max-w-2xl">
              <div
                ref={messagesEndRef}
                className="flex flex-col gap-4 mb-6 overflow-y-auto pr-2 max-h-[calc(84vh-190px)]"
                style={{ scrollBehavior: "smooth" }}
              >
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg.text}
                    sender={msg.sender}
                  />
                ))}
              </div>
            </div>

            <h1
              className={`text-2xl sm:text-3xl font-bold mb-2 ${
                messages.length > 0 ? "hidden" : "block"
              }`}
            >
              Hallo bei {COMPANY_INFO.companyName}
            </h1>
            <p
              className={`text-[var(--color-text-list)] mb-8 ${
                messages.length > 0 ? "hidden" : "block"
              }`}
            >
              Wie kann ich dir helfen?
            </p>

            <div className="w-full max-w-2xl">
              <div
                className="relative mb-6 rounded-lg border-[2px] border-gray-200 pb-5"
                style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
              >
                {uploadedFiles.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-100 rounded px-3 py-1 text-sm"
                      >
                        <span>{file.name}</span>
                        <button onClick={() => removeFile(index)}>
                          <X
                            size={16}
                            className="text-gray-500 hover:text-red-600"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Textarea
                  placeholder="Stelle eine Frage..."
                  className="w-full h-[18vh] pr-12 resize-none text-sm"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  style={{
                    paddingBottom: "2.5rem",
                    height: messages.length > 0 ? "50px" : "",
                  }}
                />

                <div className="absolute bottom-0 left-0 w-full px-2 pb-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-1 text-xs px-5 py-1 rounded-full text-[var(--custom-color-text)] cursor-pointer bg-[var(--secondary)] hover:bg-[var(--secondary-hover)]"
                    >
                      <Plus size={14} />
                      Datei hochladen
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        multiple
                      />
                    </label>

                    <Button
                      type="submit"
                      variant="destructive"
                      size="no_h"
                      className="w-8 text-xs px-5 py-1 rounded-full text-[var(--custom-color-text)] bg-[var(--background)] hover:bg-[var(--background-hover)]"
                      onClick={handleSend}
                    >
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              <div
                className={`flex flex-wrap gap-2 ${
                  messages.length > 0 ? "hidden" : "mb-8"
                }`}
              >
                {topicsList.slice(0, 5).map((topic, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="no_h"
                    className="rounded-full text-sm text-gray-500"
                    onClick={() => handleTopicClick(topic)}
                  >
                    {topic}
                  </Button>
                ))}

                {topicsList.length > 5 && (
                  <Button
                    variant="outline"
                    className="rounded-full text-sm text-gray-500"
                    size="no_h"
                  >
                    Mehr
                  </Button>
                )}
              </div>

              <div
                className={`flex justify-center ${
                  messages.length > 0 ? "hidden" : "block"
                }`}
                style={{ marginTop: "18vh" }}
              >
                <Button
                  variant="destructive"
                  className="rounded-full text-[var(--custom-color-text)] bg-[var(--background)] hover:bg-[var(--background-hover)]"
                  size="no_h"
                >
                  Hilf mir mit einem Promt
                </Button>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}
