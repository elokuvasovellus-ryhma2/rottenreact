import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';

function MovieSearch() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = import.meta.env.VITE_TMDB_TOKEN;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(search)}&include_adult=false&language=en-US`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: 'application/json',
            },
          }
        );

        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [search, token]);

  const handleMovieClick = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>

      {loading && <p className="loading-message">Loading...</p>}

      <ul className="search-results">
        {results.map((movie) => (
          <li key={movie.id}>
            <button onClick={() => handleMovieClick(movie.id)}>
              {movie.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MovieSearch;
