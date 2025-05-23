// app/chat/ChatPageClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ChatInterface from "@/components/chat-interface";

export default function ChatPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tokenStored, setTokenStored] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      router.replace('/chat'); // Clean the URL
      setTokenStored(true);
    } else {
      const localToken = localStorage.getItem('token');
      if (localToken) {
        setTokenStored(true);
      } else {
        router.push('/');
      }
    }
  }, [searchParams, router]);

  if (!tokenStored) return null;

  return (
    <main className="min-h-screen bg-white font-base">
      <ChatInterface />
    </main>
  );
}
