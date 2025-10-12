import { 
  addGroupFinnkinoItemModel, 
  getGroupFinnkinoItemsModel, 
  deleteGroupFinnkinoItemModel
} from './group_finnkino_itemsModel.js';

export async function addGroupFinnkinoItem(req, res, next) {
  try {
    const { groupId, displayText, userId, finnkinoData } = req.body;
    
    if (!groupId) {
      return res.status(400).json({ error: "groupId is required" });
    }
    
    const finalUserId = req.user?.id || userId;
    if (!finalUserId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    // Handle both simple text and JSON data
    let processedDisplayText;
    if (finnkinoData && typeof finnkinoData === 'object') {
      // Validate JSON structure
      const requiredFields = ['movie', 'theatre', 'showtime'];
      const missingFields = requiredFields.filter(field => !finnkinoData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }
      
      // Store as JSON string
      processedDisplayText = JSON.stringify(finnkinoData);
    } else if (displayText) {
      // Fallback to simple text
      processedDisplayText = displayText;
    } else {
      return res.status(400).json({ error: "Either displayText or finnkinoData is required" });
    }
    
    const result = await addGroupFinnkinoItemModel(groupId, processedDisplayText, finalUserId);
    res.status(201).json({ message: "Finnkino item added successfully", item: result });
  } catch (e) { 
    console.error("addGroupFinnkinoItem error:", e);
    next(e); 
  }
}

export async function getGroupFinnkinoItems(req, res, next) {
  try {
    const { groupId } = req.params;
    
    if (!groupId) {
      return res.status(400).json({ error: "groupId is required" });
    }
    
    const items = await getGroupFinnkinoItemsModel(groupId);
    res.json(items);
  } catch (e) { 
    console.error("getGroupFinnkinoItems error:", e);
    next(e); 
  }
}

export async function deleteGroupFinnkinoItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const { userId } = req.body;
    
    if (!itemId) {
      return res.status(400).json({ error: "itemId is required" });
    }
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    const result = await deleteGroupFinnkinoItemModel(itemId, userId);
    
    if (!result) {
      return res.status(404).json({ error: "Item not found or you don't have permission to delete it" });
    }
    
    res.json({ message: "Finnkino item deleted successfully" });
  } catch (e) { 
    console.error("deleteGroupFinnkinoItem error:", e);
    next(e); 
  }
}
