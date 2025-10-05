import { useEffect, useState } from "react";

export function AcceptGroupInvites() {
  const API = import.meta.env.VITE_API_URL;
  const adminUserId = (() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "null")?.id ?? null; }
    catch { return null; }
  })();

  const [adminGroups, setAdminGroups] = useState([]);   // [{id,name}]
  const [groupId, setGroupId] = useState("");           // valittu ryhmä
  const [pending, setPending] = useState([]);           // [{user_id}]

  // Hae ryhmät joissa olen admin
  useEffect(() => {
    if (!adminUserId) return;
    (async () => {
      const res = await fetch(`${API}/Group/get-groups-where-admin/${adminUserId}`);
      const data = await res.json();
      setAdminGroups(data || []);
      if (data?.length) setGroupId(data[0].id);
    })();
  }, [API, adminUserId]);

  // Hae valitun ryhmän pending-pyynnöt
  useEffect(() => {
    if (!groupId) { setPending([]); return; }
    (async () => {
      const res = await fetch(`${API}/Group/join/pending/${groupId}`);
      const data = await res.json();
      setPending(data || []);
    })();
  }, [API, groupId]);

  const reloadPending = async () => {
    const r = await fetch(`${API}/Group/join/pending/${groupId}`);
    setPending(await r.json());
  };

  const approve = async (userId) => {
    const r = await fetch(`${API}/Group/join/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, userId, adminUserId }),
    });
    if (!r.ok) console.error("approve failed", r.status, await r.text());
    reloadPending();
  };

  const reject = async (userId) => {
    const r = await fetch(`${API}/Group/join/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, userId, adminUserId }),
    });
    if (!r.ok) console.error("reject failed", r.status, await r.text());
    reloadPending();
  };

  return (
  <div style={{ color: "#000" }}>
    <h1>Accept Group Invites</h1>

    {adminGroups.length === 0 ? (
      <p>You are not an admin in any group.</p>
    ) : (
      <>
        <label>
          Group:&nbsp;
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            style={{ color: "#000", background: "#fff" }}
          >
            {adminGroups.map((g) => (
              <option key={g.id} value={g.id} style={{ color: "#000" }}>
                {g.name}
              </option>
            ))}
          </select>
        </label>

        {pending.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, marginTop: 10 }}>
            {pending.map((p) => (
              <li
                key={p.user_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 0",
                  borderBottom: "1px solid #000",
                }}
              >
                <code style={{ flex: 1, color: "#000", background: "transparent" }}>
                  {p.user_id}
                </code>
                <button
                  onClick={() => approve(p.user_id)}
                  style={{ color: "#000", background: "#fff", border: "1px solid #000" }}
                >
                  Accept
                </button>
                <button
                  onClick={() => reject(p.user_id)}
                  style={{ color: "#000", background: "#fff", border: "1px solid #000" }}
                >
                  Decline
                </button>
              </li>
            ))}
          </ul>
        )}
      </>
    )}
  </div>
);
}