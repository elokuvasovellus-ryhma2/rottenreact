import { useAuth } from "../../../shared/contexts/AuthContext";
import { useState, useEffect } from "react";

export function DeleteGroups() {
    const { user } = useAuth();
    const userId = user?.id;
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);

    useEffect(() => {
        fetchGroups();
    }, []);
    
    const fetchGroups = () => {
        fetch(`${import.meta.env.VITE_API_URL}/Group/get-groups-where-admin/${userId}`)
        .then(res => res.json())
        .then(data => setGroups(data))
        .catch(err => console.error('Virhe ryhmien haussa:', err));
    };

    const handleDeleteGroup = () => {
        if (!selectedGroup) {
            alert('Valitse ryhmä, jota haluat poistaa');
            return;
        }
        fetch(`${import.meta.env.VITE_API_URL}/Group/delete-group-if-admin/${selectedGroup}/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => data)
        .then(data => {
            console.log(data);  
            alert('Ryhmä poistettu');
            fetchGroups();
        })
        .catch(err => console.error('Virhe ryhmän poistamisessa:', err));
    };

    return (
        <div>
            <h1>Delete Groups (owner)</h1>
            {groups.map(group => (
                <div key={group.id} style={{ display: 'flex', alignItems: 'center', gap: '50px' , marginBottom: '5px' }}>
                    <h2>{group.name}</h2>
                    <input type="radio" name="group" value={group.id} onChange={() => setSelectedGroup(group.id)} />
                </div>
            ))}
            <button onClick={handleDeleteGroup} disabled={!selectedGroup} style={{ marginTop: '10px' , fontSize: '32px' }}>Delete Group</button>
        </div>
    );
}