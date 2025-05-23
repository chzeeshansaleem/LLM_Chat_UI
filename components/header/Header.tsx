"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageSquareMore, ChevronDown, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { COMPANY_INFO } from "@/lib/constant";
interface HeaderProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  handleNewChat:() => void;

}
export default function Header({
  selectedModel,
  setSelectedModel,
  handleNewChat
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = useState(0);

  const chatModels = [
    { label: "Chat.AI 0.5", value: "gpt-3.5-turbo" },
    { label: "Chat GPT 4o", value: "gpt-4o" },
  ];
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, [dropdownOpen]);

  return (
    <header className="relative border-b bg-[var(--header-background)] h-16">
      {/* Left logo pinned to top-left on desktop */}
      <div className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-50">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logoGroup-v1.jpg"
            alt="Logo"
            className="h-8 w-8 object-contain rounded-full"
          />
          <span className="font-semibold hidden sm:inline">
            {COMPANY_INFO.companyName}
          </span>
        </Link>
      </div>

      {/* Right buttons pinned to top-right on desktop */}
      <div className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 items-center gap-3 z-50">
        <Button
          variant="secondary"
          size="xs"
          onClick={handleNewChat}
          className="rounded-full flex items-center gap-2 text-[var(--custom-color-text)] bg-[var(--secondary)] hover:bg-[var(--secondary-hover)]"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Neuer Chat</span>
        </Button>
        <div className="hidden sm:flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 text-[var(--custom-color-text)]">
          MM
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left logo (small screens) */}
          <div className="flex lg:hidden items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logoGroup-v1.jpg"
                alt="Logo"
                className="h-8 w-8 object-contain rounded-full"
              />
              <span className="font-semibold hidden sm:inline">Chat.AWO</span>
            </Link>
          </div>

          {/* Center dropdown */}
          <div className="flex-1 flex justify-center lg:justify-start lg:pl-[72px]">
            <div
              ref={containerRef}
              className="relative inline-block ml-0 lg:ml-[140px]"
            >
              <button
                ref={buttonRef}
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={cn(
                  "bg-[var(--background)] text-[var(--custom-color-text)] text-xs px-3 py-1.5 flex items-center gap-2 transition-all",
                  dropdownOpen ? "rounded-t-lg" : "rounded-full"
                )}
              >
                <MessageSquareMore className="hidden sm:inline" size={18} />
                <span className="truncate">Chatmodell auswählen</span>
                <ChevronDown className="hidden sm:inline" size={16} />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute left-0 mt-[1px] z-50 bg-[var(--background)] rounded-b-lg shadow-lg border-t border-white/20 overflow-hidden"
                  style={{ width: `${buttonWidth}px` }}
                >
                  {chatModels.map((model) => (
                  <button
                    key={model.value}
                    onClick={() => {
                      setSelectedModel(model.value);
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-[var(--custom-color-text)] hover:bg-[var(--background-hover)]"
                  >
                    <ArrowRight size={14} />
                    {model.label}
                  </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right buttons (mobile) */}
          <div className="flex lg:hidden items-center gap-3">
            <Button
              variant="secondary"
              size="xs"
              onClick={handleNewChat}
              className="rounded-full flex items-center gap-2 text-[var(--custom-color-text)] bg-[var(--secondary)] hover:bg-[var(--secondary-hover)]"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Neuer Chat</span>
            </Button>
            <div className="hidden sm:flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 text-[var(--custom-color-text)]">
              MM
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
