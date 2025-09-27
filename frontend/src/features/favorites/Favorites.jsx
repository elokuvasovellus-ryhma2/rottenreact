
import { useState, useEffect } from 'react';
import './FavoritesPage.css';

export default function FavoritesPage() {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [checkedLists, setCheckedLists] = useState({});
  const [movies, setMovies] = useState([]);
  const [newListName, setNewListName] = useState('');

  ///////////////////////////////////////////////////////////// Get user ID from sessionStorage user object /////////////////////////////////////////////////////////////
  const getUser = () => {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };
  const user = getUser();
  const userId = user?.id;
  ///////////////////////////////////////////////////////////// Get user ID from sessionStorage user object /////////////////////////////////////////////////////////////

  // Hae käyttäjän listat
  useEffect(() => {
    if (!userId) return;
    fetch(`${import.meta.env.VITE_API_URL}/favorites/user-lists/${userId}`)
      .then(res => res.json())
      .then(data => {
        setLists(data);
        setCheckedLists(
          Object.fromEntries(data.map(list => [list.id, false]))
        );
      })
      .catch(err => console.error('Virhe listojen haussa:', err));
  }, [userId]);

  // Hae elokuvat valitusta listasta
  useEffect(() => {
    if (!selectedListId) return;
    ///////////////////////////////////////////////////////////// Debug log /////////////////////////////////////////////////////////////
    console.log('Fetching movies for listId:', selectedListId);
    ///////////////////////////////////////////////////////////// Debug log /////////////////////////////////////////////////////////////
    fetch(`${import.meta.env.VITE_API_URL}/favorites/${selectedListId}`)
      .then(res => res.json())
      .then(data => setMovies(data))
      .catch(err => console.error('Virhe elokuvien haussa:', err));
  }, [selectedListId]);

  // Luo uusi lista
  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {

      ///////////////////////////////////////////////////////////// Debug log /////////////////////////////////////////////////////////////
      console.log('Creating list with name:', newListName);
      console.log('User ID:', userId);
      ///////////////////////////////////////////////////////////// Debug log /////////////////////////////////////////////////////////////

      const res = await fetch(`${import.meta.env.VITE_API_URL}/favorites/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: newListName })
      });
      const data = await res.json();

      ///////////////////////////////////////////////////////////// Debug log /////////////////////////////////////////////////////////////
      console.log('API Response:', data); // Debug log
      ///////////////////////////////////////////////////////////// Debug log /////////////////////////////////////////////////////////////
      
      if (!data.list || !data.list.id) {
        throw new Error('Invalid response from server');
      }
      
      setLists(prev => [...prev, { id: data.list.id, name: newListName }]);
      setCheckedLists(prev => ({ ...prev, [data.list.id]: false }));
      setNewListName('');
    } catch (err) {
      console.error('Virhe listan luonnissa:', err);
    }
  };

  // Näytä elokuvat valitusta checkbox-listasta
  const handleShowCheckedList = () => {
    const selected = Object.entries(checkedLists).find(([id, checked]) => checked);
    if (selected) {
      ///////////////////////////////////////////////////////////// Debug log /////////////////////////////////////////////////////////////
      console.log('Selected list ID:', selected[0]);
      ///////////////////////////////////////////////////////////// Debug log /////////////////////////////////////////////////////////////
      setSelectedListId(selected[0]);
    }
  };

  // Simuloi listan jakamista
  const handleShareList = () => {
    const shared = Object.entries(checkedLists)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);
    alert(`Jaetaan listat: ${shared.join(', ')}`);
  };

  return (
    <div className="favorites-page">
      <div className="left-panel">
        <h2>Make a new list</h2>
        <input
          type="text"
          placeholder="Movie list name"
          value={newListName}
          onChange={e => setNewListName(e.target.value)}
        />
        <button onClick={handleCreateList}>Ok</button>

        <h3>Your lists</h3>
        <ul>
          {lists.map(list => (
            <li key={list.id}>
              <label>
                <input
                  type="checkbox"
                  checked={checkedLists[list.id] || false}
                  onChange={e =>
                    setCheckedLists(prev => ({
                      ...prev,
                      [list.id]: e.target.checked
                    }))
                  }
                />
                {list.name}
              </label>
            </li>
          ))}
        </ul>

        <button onClick={handleShowCheckedList}>Show movies in favorite list</button>
        <button onClick={handleShareList}>Share a checked list</button>
      </div>

      <div className="right-panel">
        <h2>Show movies in a list</h2>
        {movies.length === 0 ? (
          <p>No movies in this list.</p>
        ) : (
          movies.map(movie => (
            <div key={movie.movie_id} className="movie-card">
              <h3>Movie ID: {movie.movie_id}</h3>
              <p>Tähän voisi tulla elokuvan tiedot</p>
              <p>Tähän voisi tulla elokuvan kuva</p>
              <p></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
  
