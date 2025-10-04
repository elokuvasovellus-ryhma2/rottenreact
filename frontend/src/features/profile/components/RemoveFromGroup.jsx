import { useEffect, useState } from "react";
import { useAuth } from "../../../shared/contexts/AuthContext";

export function RemoveFromGroup() {
    const API = import.meta.env.VITE_API_URL;
    const { user } = useAuth();
    const userId = user?.id;
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;
        (async () => {
            const res = await fetch(`${API}/Group/get-groups-where-admin/${userId}`);
            const data = await res.json();
            setGroups(data || []);
            if (data?.length) setSelectedGroup(data[0].id);
        })();
    }, [API, userId]);

    // Fetch members when selected group changes
    useEffect(() => {
        if (!selectedGroup) return;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API}/Group/get-members/${selectedGroup}`);
                const data = await res.json();
                setMembers(data || []);
            } catch (error) {
                console.error("Error fetching members:", error);
                setMembers([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [API, selectedGroup]);

    const handleRemoveMember = async (memberUserId) => {
        if (!selectedGroup || !memberUserId || !userId) return;
        
        try {
            const res = await fetch(`${API}/Group/remove-member/${selectedGroup}/${memberUserId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    adminUserId: userId
                })
            });
            
            if (res.ok) {
                // Remove the member from the local state
                setMembers(members.filter(member => member.user_id !== memberUserId));
                alert("Member removed successfully");
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error || 'Failed to remove member'}`);
            }
        } catch (error) {
            console.error("Error removing member:", error);
            alert("Failed to remove member");
        }
    };

    return (
        <div style={{ color: "#000" }}>
            <h1>Remove From Group</h1>
            
            {groups.length === 0 ? (
                <p>You are not an admin in any group.</p>
            ) : (
                <>
                    <label>
                        Group:&nbsp;
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            style={{ color: "#000", background: "#fff" }}
                        >
                            {groups.map((g) => (
                                <option key={g.id} value={g.id} style={{ color: "#000" }}>
                                    {g.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <br /><br />
                    
                    {loading ? (
                        <p>Loading members...</p>
                    ) : members.length === 0 ? (
                        <p>No members in this group.</p>
                    ) : (
                        <div>
                            <h3>Group Members:</h3>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {members.map((member) => (
                                    <li key={member.user_id} style={{ 
                                        display: "flex", 
                                        justifyContent: "space-between", 
                                        alignItems: "center",
                                        padding: "8px",
                                        border: "1px solid #ccc",
                                        margin: "4px 0",
                                        borderRadius: "4px"
                                    }}>
                                        <span>User ID: {member.user_id}</span>
                                        <button
                                            onClick={() => handleRemoveMember(member.user_id)}
                                            style={{
                                                background: "#dc3545",
                                                color: "white",
                                                border: "none",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}