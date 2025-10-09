import { useState } from "react";
import "./groups.css";

export default function Groups() {
  const [newGroupName, setNewGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null); 

  const API = import.meta.env.VITE_API_URL;

  const userId = (() => {
    const s = sessionStorage.getItem("user");
    try { return s ? JSON.parse(s).id : null; } catch { return null; }
  })();

  const handleCreateConfirm = async () => {
  const name = newGroupName.trim();
  if (!name) return;

  setFeedback(null);

  try {
    const res = await fetch(`${API}/Group/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        name,
      }),
    });

    if (res.ok) {
      setFeedback({ type: "success", text: "Group created successfully." });
      setNewGroupName("");
    } else {
      let msg = "Failed to create group.";
      try {
        const data = await res.json();
        if (data?.error) msg = data.error;
      } catch { /* empty */ }
      if (res.status === 409) {
        msg = "A group with this name already exists.";
      }
      setFeedback({ type: "error", text: msg });
    }
  } catch {
    setFeedback({ type: "error", text: "Network error while creating group." });
  }
};

  const handleSearchConfirm = async () => {
    const res = await fetch(`${API}/Group/user-groups/all`);
    const data = await res.json();
    const q = searchQuery.trim().toLowerCase();
    const results = q ? data.filter(g => (g.name || "").toLowerCase().includes(q)) : data;

    setSearchResults(results);
    setSelectedId(null);
  };

  const handleSendJoinRequest = async () => {
    if (!selectedId || sending) return;
    setSending(true);
    setFeedback(null);

    try {
      const res = await fetch(`${API}/Group/join/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: selectedId, userId }),
      });

      if (res.ok) {
        setFeedback({ type: "success", text: "Join request sent." });
      } else {
        let msg = "Failed to send request.";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch { /* empty */ }
        if (res.status === 409) msg = "You are already a member.";
        setFeedback({ type: "error", text: msg });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error while sending request." });
    } finally {
      setSending(false);
      setSelectedId(null);
    }
  };

  return (
    <div className="groups-container">
      <h2>Make a new group</h2>
      <div className="group-input">
        <input
          type="text"
          placeholder="Group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateConfirm()}
        />
        <button onClick={handleCreateConfirm}>Confirm</button>
      </div>

      <h2>Search for a group</h2>
      <div className="group-input2">
        <input
          type="text"
          placeholder="Group name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchConfirm()}
        />
        <button onClick={handleSearchConfirm}>Confirm</button>
      </div>

      <div className="group-box">
        {searchResults.length === 0 ? (
          <p className="muted">No groups.</p>
        ) : (
          <ul className="group-list">
            {searchResults.map((g) => (
              <li key={g.id} className="group-row">
                <span className="name">{g.name}</span>
                <label className="check">
                  <input
                    type="radio"
                    name="groupSelect"
                    checked={selectedId === g.id}
                    onChange={() => setSelectedId(g.id)}
                  />
                  <span>Select</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleSendJoinRequest}
        disabled={!selectedId || sending}
      >
        {sending ? "Sending..." : "Send join request"}
      </button>

      {feedback && (
        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: feedback.type === "error" ? "#dc2626" : "#16a34a",
          }}
        >
          {feedback.text}
        </div>
      )}
    </div>
  );
}
