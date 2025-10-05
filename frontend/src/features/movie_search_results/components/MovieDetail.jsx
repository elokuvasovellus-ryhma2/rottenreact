import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./MovieDetail.css";
import ReviewForm from "../../reviews/ReviewForm";
import { Reviews } from "../../reviews/Reviews";
import { AddToFavoritesButton } from "./AddToFavoritesButton";

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = import.meta.env.VITE_TMDB_TOKEN;

  // --- user id sessionStoragesta ---
  const getUser = () => {
    const userStr = sessionStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };
  const user = getUser();
  const userId = user?.id;

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
          { headers: { Authorization: `Bearer ${token}`, accept: "application/json" } }
        );
        if (!res.ok) throw new Error(`Virhe haussa: ${res.status}`);
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error("Fetch MovieDetail error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  if (loading) return <p>Loading...</p>;
  if (!movie) return <p>Movie not found</p>;

  const { title, poster_path, release_date, overview, vote_average } = movie;

  return (
    <div className="movie-detail">
      {/* Yläosa: juliste + tiedot vierekkäin */}
      <div className="movie-header">
        <div className="poster-wrap">
          {poster_path ? (
            <img
              className="movie-poster"
              src={`https://image.tmdb.org/t/p/w300${poster_path}`}
              alt={title}
            />
          ) : (
            <div className="poster-ph" />
          )}
        </div>

        <div className="movie-info">
          <h1 className="movie-title">{title}</h1>

          <div className="movie-meta">
            <span className="badge">
              <strong>Release:</strong> {release_date || "—"}
            </span>
            <span className="badge">
              <strong>Rating:</strong>{" "}
              {typeof vote_average === "number" ? vote_average.toFixed(1) : "–"}/10
            </span>
          </div>

          {overview ? (
            <p className="movie-overview">{overview}</p>
          ) : (
            <p className="movie-overview">No description available.</p>
          )}

          <div className="actions">
            <AddToFavoritesButton userId={userId} movieId={id} />
          </div>
        </div>
      </div>

      <h2 className="section-title">Review this movie</h2>
      <ReviewForm movieId={id} />

      <Reviews movieId={id} heading="" showPosters={false} showMovieTitle={false} />
    </div>
  );
}
