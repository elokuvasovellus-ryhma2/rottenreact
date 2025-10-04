import { useEffect, useState } from "react";	
import { useAuth } from "../../../shared/contexts/AuthContext";

export function MyGroups() {

    const { user } = useAuth();
    const userId = user?.id;
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groups, setGroups] = useState([]);
    

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleRemoveFromGroup = () => {
        if (!selectedGroup) {
            alert("Valitse ryhmä, josta haluat poistua");
            return;
        }
        
        alert("Poistetaan käyttäjä " + userId + " ryhmästä " + selectedGroup);   
        fetch(`${import.meta.env.VITE_API_URL}/Group/leave-group/${userId}/${selectedGroup}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            alert('Poistettu ryhmästä');
            // Refresh the groups list after successful removal
            fetchGroups();
            // Clear selected group
            setSelectedGroup(null);
        })
        .catch(err => console.error('Virhe ryhmän poistamisessa:', err));
    };

    const fetchGroups = () => {
        fetch(`${import.meta.env.VITE_API_URL}/Group/user-every-group/${userId}`)
        .then(res => res.json())
        .then(data => setGroups(data))
        .catch(err => console.error('Virhe ryhmien haussa:', err));
    };

    return (
        <div>
            <h1>My Groups</h1>
            {groups.map(group => (
                <div key={group.id} style={{ display: 'flex', alignItems: 'center', gap: '50px' , marginBottom: '5px' }}>
                    <h2>{group.name}</h2>
                    <input type="radio" name="group" value={group.id} onChange={() => setSelectedGroup(group.id)} />
                </div>
            ))}
            <button onClick={handleRemoveFromGroup} style={{ marginTop: '10px' , fontSize: '32px' }}>Leave from Group</button>
        </div>
    );
}