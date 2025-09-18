import React, { useState, useEffect } from 'react';
import { useNavigate }                from 'react-router-dom';
import './Search.css';

export default function MovieSearch() {
  const [query, setQuery]           = useState('');
  const [year, setYear]             = useState('');
  const [genre, setGenre]           = useState('');
  const [genresList, setGenresList] = useState([]);
  const navigate                    = useNavigate();
  const token                       = import.meta.env.VITE_TMDB_TOKEN;

  
  useEffect(() => {
    fetch('https://api.themoviedb.org/3/genre/movie/list?language=en-US', {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => setGenresList(data.genres || []))
      .catch(console.error);
  }, [token]);

  const handleSubmit = e => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.append('query', query.trim());
    if (year)          params.append('year',  year);
    if (genre)         params.append('genre', genre);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="search-container">
      <input
        type="text"
        placeholder="Search Movie…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        name="query"
        id="query-input"
      />
      <input
        type="number"
        placeholder="Year"
        value={year}
        onChange={e => setYear(e.target.value)}
        name="year"
        id="year-input"
        min="1900"
        max={new Date().getFullYear()}
      />
      <select
        value={genre}
        onChange={e => setGenre(e.target.value)}
        name="genre"
        id="genre-select"
      >
        <option value="">All genres</option>
        {genresList.map(g => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      <button type="submit">Search</button>
    </form>
  );
}