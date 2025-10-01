import { useState } from "react";
import "./groups.css";

export function Groups() {
  const [newGroupName, setNewGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); 

  const API = import.meta.env.VITE_API_URL;
  
const userId = (() => {
  const s = sessionStorage.getItem("user");
  try { return s ? JSON.parse(s).id : null; } catch { return null; }
})();


const handleCreateConfirm = async () => {
  const name = newGroupName.trim();
  if (!name) return;

  await fetch(`${API}/Group/create`, {              
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: JSON.parse(sessionStorage.getItem("user")).id,
      name
    }),
  });

  setNewGroupName("");
};

  const handleSearchConfirm = () => {
    // TODO: myöhemmin tee GET /api/groups/search?q=searchQuery
    setSearchResults([]); // pidetään tyhjänä kunnes backend on valmis
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
                  <input type="checkbox" />
                  <span>Checkbox</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
