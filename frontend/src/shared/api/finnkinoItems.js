const API = import.meta.env.VITE_API_URL;

export const finnkinoItemsAPI = {
  // Add a Finnkino item to a group (simple text)
  addItem: async (groupId, displayText, userId) => {
    const response = await fetch(`${API}/group-finnkino-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        groupId,
        displayText,
        userId
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add Finnkino item');
    }
    
    return response.json();
  },

  // Add a Finnkino item with rich JSON data
  addFinnkinoItem: async (groupId, finnkinoData, userId) => {
    const response = await fetch(`${API}/group-finnkino-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        groupId,
        finnkinoData,
        userId
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add Finnkino item');
    }
    
    return response.json();
  },

  // Get all Finnkino items for a group
  getItems: async (groupId) => {
    const response = await fetch(`${API}/group-finnkino-items/group/${groupId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch Finnkino items');
    }
    
    return response.json();
  },

  // Delete a Finnkino item
  deleteItem: async (itemId) => {
    const response = await fetch(`${API}/group-finnkino-items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete Finnkino item');
    }
    
    return response.json();
  }
};
