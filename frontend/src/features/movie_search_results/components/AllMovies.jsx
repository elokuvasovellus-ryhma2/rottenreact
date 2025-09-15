
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './allMovies.css';
import Header from './Header';


function AllMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scroll, setScroll] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [genresList, setGenresList] = useState([]);
  const token = import.meta.env.VITE_TMDB_TOKEN;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          'https://api.themoviedb.org/3/genre/movie/list?language=en',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: 'application/json',
            },
          }
        );
        const data = await response.json();
        setGenresList(data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, [token]);

  const fetchMovies = async (page) => {
    try {
      const genreQuery = selectedGenre ? `&with_genres=${selectedGenre}` : '';
      const yearQuery = selectedYear ? `&primary_release_year=${selectedYear}` : '';
      const ratingQuery = selectedRating ? `&vote_average.gte=${selectedRating}` : '';

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?page=${page}${genreQuery}${yearQuery}${ratingQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        }
      );

      const data = await response.json();
      setMovies(data.results);
      setTotalPages(data.total_pages);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching movies:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(currentPage);
  }, [currentPage, token]);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleMovieClick = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  console.log('Movies:', movies);

  return (
    <div className="container-fluid">
      <section>
        <div className="filter-section">
          <select onChange={(e) => setSelectedGenre(e.target.value)} value={selectedGenre}>
            <option value="">Select Genre</option>
            {genresList.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
          <input
            className="year"
            type="text"
            placeholder="Release Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          />
          <input
            className="rating"
            type="number"
            placeholder="Minimum Rating"
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
          />
          <button onClick={() => fetchMovies(currentPage)}>Apply Filters</button>
        </div>

        <div className="movies">
          {loading ? (
            <p>Loading movies...</p>
          ) : (
            <>
              <div className="row">
                {movies.map((movie) => (
                  <div className="col-md-3" key={movie.id}>
                    <div className="card" onClick={() => handleMovieClick(movie.id)}>
                      <img
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
                            : 'https://via.placeholder.com/300x450?text=No+Image'
                        }
                        alt={movie.title}
                        className="card-img-top"
                      />
                      <div className="card-body">
                        <h5 className="card-title">{movie.title}</h5>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pagination">
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        <Header scroll={scroll} />
      </section>
    </div>
  );
}

export default AllMovies;
