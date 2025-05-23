export const createNewChatApi = async (title: string, modelUsed: string) => {
    try {
      const response = await fetch('https://corpgpt-api.corpgpt.automait.ai/api/v1/chats/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          status: 'active',
          model_used: modelUsed,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create new chat');
      }
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error in createNewChatApi:', error);
      throw error;
    }
  };

  export const updateChatTitleApi = async (threadId: string, title: string) => {
    try {
      const response = await fetch(`https://corpgpt-api.corpgpt.automait.ai/api/v1/chats/${threadId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          status: "active",
          model_used: "string", // You can pass this as a parameter if needed
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update chat title");
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error in updateChatTitleApi:", error);
      throw error;
    }
  };

  export const deleteChatApi = async (threadId: string) => {
    try {
      const response = await fetch(
        `https://corpgpt-api.corpgpt.automait.ai/api/v1/chats/${threadId}`,
        {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }
  
      return true;
    } catch (error) {
      console.error("Error in deleteChatApi:", error);
      throw error;
    }
  };
  
  