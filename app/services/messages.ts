// messages.ts

export const fetchMessagesByChatIdApi = async (chatId: string) => {
    try {
      const res = await fetch(`https://corpgpt-api.corpgpt.automait.ai/api/v1/messages/?chat_id=${chatId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!res.ok) {
        throw new Error("Failed to fetch chat messages");
      }
  
      const data = await res.json();
      return data; // likely an array or an object containing array of messages
    } catch (error) {
      console.error("Error in fetchMessagesByChatId:", error);
      throw error;
    }
  };
  
  export const saveAssistantResponseApi = async (
    content: string,
    modelUsed: string,
    chatId: number
  ) => {
    try {
      const res = await fetch("https://corpgpt-api.corpgpt.automait.ai/api/v1/messages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          role: "assistant",
          content,
          model_used: modelUsed,
          chat_id: chatId,
        }),
      });
  
      if (!res.ok) {
        throw new Error("Failed to save assistant response");
      }
  
      const data = await res.json();
      return data; // You may want to return saved message or confirmation
    } catch (error) {
      console.error("Error in saveAssistantResponseApi:", error);
      throw error;
    }
  };
  
  export const sendUserMessageApi = async (
    content: string,
    modelUsed: string,
    chatId: number
  ) => {
    try {
      const res = await fetch("https://corpgpt-api.corpgpt.automait.ai/api/v1/messages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          role: "user",
          content,
          model_used: modelUsed,
          chat_id: chatId,
        }),
      });
  
      if (!res.ok) {
        throw new Error("Failed to send user message");
      }
  
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error in sendUserMessageApi:", error);
      throw error;
    }
  };
  