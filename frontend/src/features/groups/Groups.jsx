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
    <div className="groups-page">
      <div className="group-form">
        <h2>Create New Group</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateConfirm()}
            className="input"
          />
          <button 
            onClick={handleCreateConfirm}
            className="btn btn-primary"
            disabled={!newGroupName.trim()}
          >
            Create Group
          </button>
        </div>
      </div>

      <div className="search-section">
        <h3>Search for Groups</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Search group name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchConfirm()}
            className="input"
          />
          <button 
            onClick={handleSearchConfirm}
            className="btn btn-secondary"
            disabled={!searchQuery.trim()}
          >
            Search
          </button>
        </div>

        <div className="search-results">
          {searchResults.length === 0 ? (
            <p className="no-results">No groups found.</p>
          ) : (
            <div className="group-list">
              {searchResults.map((g) => (
                <div 
                  key={g.id} 
                  className={`search-result-item ${selectedId === g.id ? 'selected' : ''}`}
                  onClick={() => setSelectedId(g.id)}
                >
                  <span className="group-name">{g.name}</span>
                  <input
                    type="radio"
                    name="groupSelect"
                    checked={selectedId === g.id}
                    onChange={() => setSelectedId(g.id)}
                    className="group-radio"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedId && (
        <div className="action-section">
          <button
            className="btn btn-accent btn-lg"
            onClick={handleSendJoinRequest}
            disabled={sending}
          >
            {sending ? "Sending Request..." : "Send Join Request"}
          </button>
        </div>
      )}

      {feedback && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.text}
        </div>
      )}
    </div>
  );
}