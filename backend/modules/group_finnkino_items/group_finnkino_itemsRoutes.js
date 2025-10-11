import { Router } from 'express';
import { 
  addGroupFinnkinoItem, 
  getGroupFinnkinoItems, 
  deleteGroupFinnkinoItem
} from './group_finnkino_itemsController.js';

const router = Router();

// Add a Finnkino item to a group
router.post('/', addGroupFinnkinoItem);

// Get all Finnkino items for a group
router.get('/group/:groupId', getGroupFinnkinoItems);

// Delete a Finnkino item (only by the user who created it)
router.delete('/:itemId', deleteGroupFinnkinoItem);

export default router;
