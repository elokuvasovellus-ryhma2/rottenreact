
import React, { useState, useEffect } from 'react';

export function AddToFavoritesButton({ userId, movieId }) {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('');

  useEffect(() => {
    if (!userId) return;
    fetch(`${import.meta.env.VITE_API_URL}/favorites/user-lists/${userId}`)
      .then(res => res.json())
      .then(data => setLists(data))
      .catch(err => console.error('Virhe listojen haussa:', err));
  }, [userId]);

  const handleAdd = async () => {
    if (!selectedListId) {
      alert('Valitse lista ensin');
      return;
    }

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/favorites/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId: selectedListId, movieId })
      });
      alert('Elokuva lisätty suosikkilistaan!');
    } catch (err) {
      console.error('Virhe lisättäessä:', err);
    }
  };

  return (
    <div className="add-to-favorites">
      <h3>Add to favorite list</h3>
      <select
        value={selectedListId}
        onChange={e => setSelectedListId(e.target.value)}
      >
        <option value="">-- Select list --</option>
        {lists.map(list => (
          <option key={list.id} value={list.id}>
            {list.name}
          </option>
        ))}
      </select>
      <button onClick={handleAdd}>Add to list</button>
    </div>
  );
}