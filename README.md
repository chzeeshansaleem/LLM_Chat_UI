# 🧠 LLM Chat UI — `chat.awo`

A modern, responsive chat interface built using **Next.js**, **Tailwind CSS**, and **Radix UI**, with full **SSO authentication** and **LLM API integration** for real-time assistant interactions.

---

## 🚀 Features

- ⚡ Real-time LLM assistant chat interface
- 🔒 Single Sign-On (SSO) authentication
- 🧠 GPT-powered backend API integration
- 🎨 Radix UI components with TailwindCSS for styling
- 📈 Embla Carousel, Recharts, and more for enhanced UI/UX
- 🧩 Modular component structure for scalability
- ✅ TypeScript support

---

## 📦 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **UI**: [TailwindCSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **Auth**: SSO Integration
- **API Integration**: Custom backend via `corpgpt-api.corpgpt.automait.ai`
- **Forms**: `react-hook-form`, `zod`
- **Charts**: Recharts
- **Carousel**: Embla Carousel

---

## 📂 Project Structure

```bash
├── app/                  # Next.js App Router structure
├── components/           # UI and chat components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API services
├── public/               # Static assets
├── styles/               # Global styles (TailwindCSS)
├── .env.example          # Example environment variables
├── tailwind.config.ts    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```
**🛠️ Setup Instructions**
Clone the repository:

git clone git@github.com:chzeeshansaleem/LLM_Chat_UI.git
cd LLM_Chat_UI

**Set up environment variables:**
.env.example .env.local

## Install dependencies:

```bash
npm install
npm run build
npm run start
```




