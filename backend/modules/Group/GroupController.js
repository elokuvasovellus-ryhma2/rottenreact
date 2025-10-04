import crypto from "crypto";
import { pool } from "../../config/database.js";

export async function createGroup(req, res) {
  try {
    const { userId, name } = req.body;
    if (!userId) return res.status(400).json({ error: "userID missing" });
    if (!name || !name.trim()) return res.status(400).json({ error: "Name missing" });
 
    const id = crypto.randomUUID();
 
    // Start a transaction to ensure both operations succeed or fail together
    await pool.query('BEGIN');
 
    try {
      // Create the group
      const { rows: [group] } = await pool.query(
        `INSERT INTO groups (id, owner_user_id, name)
         VALUES ($1, $2, $3)
         RETURNING id, owner_user_id, name`,
        [id, userId, name.trim()]
      );
 
      // Add the creator as an admin member of the group
      await pool.query(
        `INSERT INTO group_memberships (group_id, user_id, role, is_approved)
         VALUES ($1, $2, 'admin', true)`,
        [id, userId]
      );
 
      // Commit the transaction
      await pool.query('COMMIT');
 
      return res.status(201).json({ message: "Ryhmä luotu", group });
    } catch (error) {
      // Rollback the transaction if any operation fails
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (e) {
    console.error("createGroup error:", e);
    return res.status(500).json({ error: "Creating group failed" });
  }
}


export async function getUserGroups(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const { rows } = await pool.query(
      `SELECT id, name
       FROM groups
       WHERE owner_user_id = $1
       ORDER BY name ASC`,
      [userId]
    );

    return res.json(rows);
  } catch (e) {
    console.error("getUserGroups error:", e);
    return res.status(500).json({ error: "Fetching groups failed" });
  }
}

// Get all groups where the user is a member or admin

  export async function getUserEveryGroup(req, res){
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: "Missing userId" });

      const { rows } = await pool.query(
        `SELECT groups.id, groups.name, group_memberships.role, group_memberships.is_approved
         FROM groups
         JOIN group_memberships ON groups.id = group_memberships.group_id
         WHERE group_memberships.user_id = $1
         ORDER BY groups.name ASC`,
        [userId]
      );

      return res.json(rows);
    } catch (e) {
      console.error("getUserEveryGroup error:", e);
      return res.status(500).json({ error: "Fetching groups failed" });
    }
  }  

// Leave a group

  export async function leaveGroup(req, res) {
    try {
      const { userId, groupId } = req.params;
      if (!userId || !groupId) return res.status(400).json({ error: "Missing userId or groupId" });

      await pool.query('BEGIN');

      try {
        // Check if the user is the group owner
        const { rows: groupOwner } = await pool.query(
          `SELECT owner_user_id FROM groups WHERE id = $1`,
          [groupId]
        );

        if (groupOwner.length === 0) {
          await pool.query('ROLLBACK');
          return res.status(404).json({ error: "Group not found" });
        }

        if (groupOwner[0].owner_user_id === userId) {
          await pool.query('ROLLBACK');
          return res.status(403).json({ error: "Group owner cannot leave the group" });
        }

        // Only delete membership if user is not the owner
        await pool.query(
          `DELETE FROM group_memberships
           WHERE user_id = $1 AND group_id = $2`,
          [userId, groupId]
        );

        await pool.query('COMMIT');
        return res.json({ message: "Poistettu ryhmästä" });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (e) {
      console.error("leaveGroup error:", e);
      return res.status(500).json({ error: "Poistaminen ryhmästä epäonnistui" });
    }
  }

// Get all groups where the user is a admin

  export async function getGroupsWhereAdmin(req, res) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: "Missing userId" });

      const { rows } = await pool.query(
        `SELECT groups.id, groups.name, group_memberships.role, group_memberships.is_approved
         FROM groups
         JOIN group_memberships ON groups.id = group_memberships.group_id
         WHERE group_memberships.user_id = $1 AND group_memberships.role = 'admin'
         ORDER BY groups.name ASC`,
        [userId]
      );

      return res.json(rows);
    } catch (e) {
      console.error("getGroupsWhereAdmin error:", e);
      return res.status(500).json({ error: "Fetching admin groups failed" });
    }
  }

// Delete a group if the user is a admin

export async function deleteGroupIfAdmin(req, res) {
  try {
    const { groupId, userId } = req.params;
    if (!groupId || !userId) return res.status(400).json({ error: "Missing groupId or userId" });

    await pool.query('BEGIN');

    try {
      // First check if user is admin of the group
      const { rows: membership } = await pool.query(
        `SELECT role FROM group_memberships 
         WHERE group_id = $1 AND user_id = $2 AND role = 'admin'`,
        [groupId, userId]
      );

      if (membership.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(403).json({ error: "You must be an admin to delete this group" });
      }

      // Delete all group memberships first (foreign key constraint)
      await pool.query(
        `DELETE FROM group_memberships WHERE group_id = $1`,
        [groupId]
      );

      // Delete the group
      await pool.query(
        `DELETE FROM groups WHERE id = $1`,
        [groupId]
      );

      await pool.query('COMMIT');
      return res.json({ message: "Ryhmä poistettu onnistuneesti" });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (e) {
    console.error("deleteGroupIfAdmin error:", e);
    return res.status(500).json({ error: "Ryhmän poistaminen epäonnistui" });
  }
}

  
