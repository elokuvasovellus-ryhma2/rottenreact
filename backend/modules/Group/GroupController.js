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
    const q = (req.query.q || "").trim();

    // GLOBAALI HAKU: /Group/user-groups/all[?q=...]
    if (userId === "all") {
      if (q) {
        const { rows } = await pool.query(
          `SELECT id, name
             FROM groups
            WHERE name ILIKE $1
         ORDER BY name ASC`,
          [`%${q}%`]
        );
        return res.json(rows);
      } else {
        const { rows } = await pool.query(
          `SELECT id, name
             FROM groups
         ORDER BY name ASC`
        );
        return res.json(rows);
      }
    }

    if (!userId) return res.status(400).json({ error: "Missing userId" });

    if (q) {
      const { rows } = await pool.query(
        `SELECT id, name
           FROM groups
          WHERE owner_user_id = $1
            AND name ILIKE $2
       ORDER BY name ASC`,
        [userId, `%${q}%`]
      );
      return res.json(rows);
    } else {
      const { rows } = await pool.query(
        `SELECT id, name
           FROM groups
          WHERE owner_user_id = $1
       ORDER BY name ASC`,
        [userId]
      );
      return res.json(rows);
    }
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
         WHERE group_memberships.user_id = $1 AND group_memberships.is_approved = true
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

//Join request
export async function requestToJoin(req, res) {
  const client = await pool.connect();
  try {
    const { groupId, userId } = req.body;
    if (!groupId || !userId) {
      client.release();
      return res.status(400).json({ error: "groupId & userId required" });
    }

    await client.query("BEGIN");

    // Lukitse mahdollinen olemassa oleva rivi
    const { rows } = await client.query(
      `SELECT is_approved
         FROM group_memberships
        WHERE group_id = $1 AND user_id = $2
        FOR UPDATE`,
      [groupId, userId]
    );

    if (rows.length === 0) {
      await client.query(
        `INSERT INTO group_memberships (group_id, user_id, role, is_approved)
         VALUES ($1, $2, 'member', false)`,
        [groupId, userId]
      );
    } else if (rows[0].is_approved) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Already a member" });
    } else {
      await client.query(
        `UPDATE group_memberships
            SET role = 'member', is_approved = false
          WHERE group_id = $1 AND user_id = $2`,
        [groupId, userId]
      );
    }

    await client.query("COMMIT");
    return res.status(201).json({ ok: true });
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error("requestToJoin error:", e);
    return res.status(500).json({ error: "Join request failed" });
  } finally {
    client.release();
  }
}

// --- PENDING-LISTA (ei JOINIA users-tauluun) ---
export async function listPendingForGroup(req, res) {
  try {
    const { groupId } = req.params;
    if (!groupId) return res.status(400).json({ error: "Missing groupId" });

    const { rows } = await pool.query(
      `SELECT user_id
         FROM group_memberships
        WHERE group_id = $1 AND is_approved = false
        ORDER BY user_id`,
      [groupId]
    );
    return res.json(rows); 
  } catch (e) {
    console.error("listPendingForGroup error:", e);
    return res.status(500).json({ error: e.message || "Failed to fetch pending requests" });
  }
}

// --- HYVÄKSY (owner TAI admin) ---
export async function approveJoin(req, res) {
  try {
    const { groupId, userId, adminUserId } = req.body;
    if (!groupId || !userId || !adminUserId) {
      return res.status(400).json({ error: "groupId, userId, adminUserId required" });
    }

    // oikeustarkistus: owner groups-taulusta TAI admin memberinä
    const { rows } = await pool.query(
      `
      SELECT
        EXISTS (SELECT 1 FROM groups g
                 WHERE g.id = $1 AND g.owner_user_id = $2) AS is_owner,
        EXISTS (SELECT 1 FROM group_memberships gm
                 WHERE gm.group_id = $1 AND gm.user_id = $2
                   AND gm.is_approved = true AND gm.role = 'admin') AS is_admin
      `,
      [groupId, adminUserId]
    );
    const allowed = rows[0]?.is_owner || rows[0]?.is_admin;
    if (!allowed) return res.status(403).json({ error: "Not allowed" });

    const upd = await pool.query(
      `UPDATE group_memberships
          SET is_approved = true
        WHERE group_id = $1 AND user_id = $2 AND is_approved = false`,
      [groupId, userId]
    );
    if (!upd.rowCount) return res.status(404).json({ error: "No pending request" });

    return res.json({ ok: true });
  } catch (e) {
    console.error("approveJoin error:", e);
    return res.status(500).json({ error: e.message || "Approve failed" });
  }
}

// --- HYLKÄÄ (owner TAI admin) ---
export async function rejectJoin(req, res) {
  try {
    const { groupId, userId, adminUserId } = req.body;
    if (!groupId || !userId || !adminUserId) {
      return res.status(400).json({ error: "groupId, userId, adminUserId required" });
    }

    const { rows } = await pool.query(
      `
      SELECT
        EXISTS (SELECT 1 FROM groups g
                 WHERE g.id = $1 AND g.owner_user_id = $2) AS is_owner,
        EXISTS (SELECT 1 FROM group_memberships gm
                 WHERE gm.group_id = $1 AND gm.user_id = $2
                   AND gm.is_approved = true AND gm.role = 'admin') AS is_admin
      `,
      [groupId, adminUserId]
    );
    const allowed = rows[0]?.is_owner || rows[0]?.is_admin;
    if (!allowed) return res.status(403).json({ error: "Not allowed" });

    const del = await pool.query(
      `DELETE FROM group_memberships
        WHERE group_id = $1 AND user_id = $2 AND is_approved = false`,
      [groupId, userId]
    );
    if (!del.rowCount) return res.status(404).json({ error: "No pending request" });

    return res.json({ ok: true });
  } catch (e) {
    console.error("rejectJoin error:", e);
    return res.status(500).json({ error: e.message || "Reject failed" });
  }
}

// Get all the members of a group if the user is a admin (only approved members)

export async function getMembersOfGroupIfAdmin(req, res) {
  try {
    const { groupId } = req.params;
    if (!groupId) return res.status(400).json({ error: "Missing groupId" });

    const { rows } = await pool.query(
      `SELECT user_id FROM group_memberships WHERE group_id = $1 AND is_approved = true AND role = 'member'`,
      [groupId]
    );
    return res.json(rows);
  } catch (e) {
    console.error("getMembersOfGroupIfAdmin error:", e);
    return res.status(500).json({ error: "Fetching members of group failed" });
  }
}



// Remove a user from a group if the user is a admin

export async function removeFromGroupIfAdmin(req, res) {
  try {
    const { groupId, userId } = req.params;
    const { adminUserId } = req.body;
    if (!groupId || !userId || !adminUserId) return res.status(400).json({ error: "Missing groupId, userId, or adminUserId" });

    await pool.query('BEGIN');

    try {
      // Check if the requesting user is admin of the group
      const { rows: membership } = await pool.query(
        `SELECT role FROM group_memberships 
         WHERE group_id = $1 AND user_id = $2 AND role = 'admin'`,
        [groupId, adminUserId]
      );

      if (membership.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(403).json({ error: "You must be an admin to remove a user from the group" });
      }

      // Remove the user from the group
      await pool.query(
        `DELETE FROM group_memberships WHERE group_id = $1 AND user_id = $2`,
        [groupId, userId]
      );

      await pool.query('COMMIT');
      return res.json({ message: "User removed from group" });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (e) {
    console.error("removeFromGroupIfAdmin error:", e);
    return res.status(500).json({ error: "Removing user from group failed" });
  }
}
