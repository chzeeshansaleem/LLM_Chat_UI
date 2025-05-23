import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight"; // optional, for syntax highlighting
import "highlight.js/styles/github.css"; // or another style

interface ChatMessageProps {
  message: string;
  sender: "user" | "bot";
}

export default function ChatMessage({ message, sender }: ChatMessageProps) {
  const isUser = sender === "user";

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "w-full sm:w-[80%] px-4 py-3 rounded-md text-sm prose prose-sm max-w-none break-words",
          isUser
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-100 text-gray-900 rounded-bl-none"
        )}
      >
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
          {message}
        </ReactMarkdown>
      </div>
    </div>
  );
}
