import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './MovieDetail.css';

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie]     = useState(null);
  const [loading, setLoading] = useState(true);
  const token                  = import.meta.env.VITE_TMDB_TOKEN;

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchMovie() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: 'application/json',
            },
          }
        );
        if (!res.ok) {
          throw new Error(`Virhe haussa: ${res.status}`);
        }
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error('Fetch MovieDetail error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [id, token]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!movie) {
    return <p>Movie not found</p>;
  }

  const {
    title,
    poster_path,
    release_date,
    overview,
    vote_average,
  } = movie;

  return (
    <div className="movie-detail">
      <h1>{title}</h1>

      {poster_path && (
        <img
          src={`https://image.tmdb.org/t/p/w500${poster_path}`}
          alt={title}
        />
      )}

      <p>
        <strong>Release Date:</strong> {release_date}
      </p>

      <p>
        <strong>Description:</strong> {overview}
      </p>

      <p>
        <strong>Rating:</strong>{' '}
        {typeof vote_average === 'number'
          ? vote_average.toFixed(1)
          : '–'}{' '}
        / 10
      </p>
    </div>
  );
}