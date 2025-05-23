// app/chat/page.tsx
import { Suspense } from 'react';
import ChatPageClient from './ChatPageClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatPageClient />
    </Suspense>
  );
}
