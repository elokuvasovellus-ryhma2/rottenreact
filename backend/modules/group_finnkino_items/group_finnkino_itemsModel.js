import { pool } from '../../config/database.js';

export async function addGroupFinnkinoItemModel(groupId, displayText, userId) {
  const sql = `
    INSERT INTO group_finnkino_items (group_id, display_text, added_by_user_id)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const params = [groupId, displayText, userId];
  const { rows } = await pool.query(sql, params);
  return rows[0];
}

export async function getGroupFinnkinoItemsModel(groupId) {
  const sql = `
    SELECT 
      group_finnkino_items.id,
      group_finnkino_items.group_id,
      group_finnkino_items.display_text,
      group_finnkino_items.added_by_user_id,
      users.email as added_by_email,
      groups.name as group_name
    FROM group_finnkino_items
    LEFT JOIN users ON group_finnkino_items.added_by_user_id = users.id
    LEFT JOIN groups ON group_finnkino_items.group_id = groups.id
    WHERE group_finnkino_items.group_id = $1
    ORDER BY group_finnkino_items.id DESC;
  `;
  const { rows } = await pool.query(sql, [groupId]);
  return rows;
}

export async function deleteGroupFinnkinoItemModel(itemId, userId) {
  const sql = `
    DELETE FROM group_finnkino_items 
    WHERE id = $1 AND added_by_user_id = $2
    RETURNING *;
  `;
  const { rows } = await pool.query(sql, [itemId, userId]);
  return rows[0];
}
