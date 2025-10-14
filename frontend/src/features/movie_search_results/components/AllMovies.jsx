import React, { useState, useEffect } from 'react';
import { useNavigate }                from 'react-router-dom';
import './allMovies.css';
import Header from './Header';

export default function AllMovies({
  query        = '',
  year         = '',
  genre        = '',
  initialPage  = 1,
}) {
  const [movies,      setMovies]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages,  setTotalPages]  = useState(0);
  const [genresList,  setGenresList]  = useState([]);
  const token   = import.meta.env.VITE_TMDB_TOKEN;
  const navigate = useNavigate();

  
  useEffect(() => {
    fetch('https://api.themoviedb.org/3/genre/movie/list?language=en-US', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setGenresList(data.genres || []))
      .catch(console.error);
  }, [token]);

  
  const buildUrl = page => {
    const params = new URLSearchParams();
    params.set('language', 'en-US');
    params.set('page', page);

    if (query) {
      params.set('query', query.trim());
      return `https://api.themoviedb.org/3/search/movie?${params.toString()}`;
    }

    if (genre) params.set('with_genres', genre);
    if (year)  params.set('primary_release_year', year);

    return `https://api.themoviedb.org/3/discover/movie?${params.toString()}`;
  };

  
useEffect(() => {
  setLoading(true);
  fetch(buildUrl(currentPage), {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      let results = data.results || [];

      if (year) {
        results = results.filter(movie =>
          movie.release_date?.startsWith(year)
        );
      }

      setMovies(results);
      setTotalPages(data.total_pages || 0);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
}, [query, year, genre, currentPage, token]);

  const handleMovieClick = id => navigate(`/movies/${id}`);
  const handlePrev       = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext       = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  return (
    <div className="all-movies">
      {loading && <p className="loading">Loading movies…</p>}
      {!loading && movies.length === 0 && <p className="no-results">No movies found</p>}

      <div className="movie-grid">
        {movies.map(movie => (
          <div
            key={movie.id}
            className="movie-card"
            onClick={() => handleMovieClick(movie.id)}
          >
            {movie.poster_path
              ? <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  className="card-img-top"
                />
              : <div className="no-image">No image</div>
            }
            <p className="card-title">{movie.title}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={handlePrev} disabled={currentPage === 1}>
          Prev
        </button>
        <span>
          Page {currentPage} / {totalPages}
        </span>
        <button onClick={handleNext} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      <Header scroll={window.scrollY} />
    </div>
  );
}