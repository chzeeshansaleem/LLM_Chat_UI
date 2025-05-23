const BASE_URL = "https://corpgpt-api.corpgpt.automait.ai/api/v1/chats"; // ✅ Make sure it's HTTPS

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  console.log(token)
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const createChat = async (title: string, model_used: string) => {
  const res = await fetch("/api/corpgpt/chats", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title,
      status: "active",
      model_used,
    }),
  });

  if (!res.ok) throw new Error("Failed to create chat");
  return res.json();
};


export const fetchAllChats = async () => {
  const res = await fetch(BASE_URL, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
};

export const fetchAllChatsMe = async () => {
  const res = await fetch(`${BASE_URL}/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
};

export const fetchChatById = async (chatId: number) => {
  const res = await fetch(`${BASE_URL}/${chatId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch chat by ID");
  return res.json();
};
