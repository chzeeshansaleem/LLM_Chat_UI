// app/page.tsx
'use client';


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from "@/components/chat-interface";


export default function Home() {
 const router = useRouter();
 const [email, setEmail] = useState('');
 const [error, setError] = useState<string | null>(null);
 const [isLoading, setIsLoading] = useState(false);
 const [isAuthenticated, setIsAuthenticated] = useState(false);


 useEffect(() => {
   const token = localStorage.getItem('token'); // adjust key as needed
   if (token) {
     setIsAuthenticated(true);
     router.push('/chat');
   }
 }, [router]);


 const handleSAMLSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setIsLoading(true);
   setError(null);


   try {
     const response = await fetch(
       `https://corpgpt-api.corpgpt.automait.ai/api/v1/saml/discover-tenant?email=${encodeURIComponent(email)}&relayState=${encodeURIComponent(window.location.origin)}`,
       {
         method: 'POST',
         credentials: 'include',
         headers: { 'Accept': 'application/json' },
       }
     );


     if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.detail?.[0]?.msg || 'Discovery failed');
     }


     const result = await response.json();
     if (result.redirect_url) {
       window.location.href = result.redirect_url;
     }
   } catch (err) {
     setError(err instanceof Error ? err.message : 'Unknown error occurred');
   } finally {
     setIsLoading(false);
   }
 };


 if (!isAuthenticated) {
   return (
     <main className="min-h-screen bg-white font-base flex items-center justify-center">
       <div className="max-w-md w-full space-y-8 p-4">
         <div className="text-center">
           <h1 className="text-3xl font-bold text-gray-900">SAML Login</h1>
           <p className="mt-2 text-gray-600">Enter your work email to continue</p>
         </div>
        
         <form className="mt-8 space-y-6" onSubmit={handleSAMLSubmit}>
           <div className="rounded-md shadow-sm -space-y-px">
             <input
               type="email"
               required
               className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
               placeholder="your@company.com"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
             />
           </div>


           {error && (
             <div className="text-red-600 text-sm mt-2">
               {error}
             </div>
           )}


           <button
             type="submit"
             disabled={isLoading}
             className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--background)] hover:bg-[var(--background-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
           >
             {isLoading ? 'Redirecting...' : 'Continue with SSO'}
           </button>
         </form>
       </div>
     </main>
   );
 }


 return (
   <main className="min-h-screen bg-white font-base">
     <ChatInterface />
   </main>
 );
}



