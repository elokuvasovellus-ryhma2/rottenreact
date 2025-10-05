import React, { useEffect, useState } from "react";
import "./ReviewCard.css";
import ReviewToGroup from "./ReviewToGroup";

function Stars({ value = 0 }) {
  const full = Math.round(value);
  return (
    <div className="stars" aria-label={`Rating ${full}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? "star on" : "star off"}>★</span>
      ))}
    </div>
  );
}

export default function ReviewCard({
  review,
  showPoster = true,
  showMovieTitle = true,   // 👈 uusi prop
  variant = "normal",
}) {
  const [movie, setMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = import.meta.env.VITE_TMDB_TOKEN;

  useEffect(() => {
    if (!showPoster) return;
    let alive = true;
    if (!review.movieId) return;
    (async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${review.movieId}?language=en-US`,
          { headers: { Authorization: `Bearer ${token}`, accept: "application/json" } }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setMovie(data);
      } catch { /* ignore */ }
    })();
    return () => { alive = false; };
  }, [review.movieId, token, showPoster]);

  const posterSize = variant === "compact" ? "w185" : "w342";

  const handleCardClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <article 
        className={`review-card ${variant} clickable`} 
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        aria-label={`View review for ${movie?.title || `Movie #${review.movieId}`}`}
      >
        {showPoster && (
          <div className="poster" aria-hidden>
            {movie?.poster_path ? (
              <img
                className="poster-img"
                src={`https://image.tmdb.org/t/p/${posterSize}${movie.poster_path}`}
                alt={movie?.title}
              />
            ) : (
              <div className="ph" />
            )}
          </div>
        )}

        <div className="meta">
          {}
          {showMovieTitle && movie?.title ? (
            <h3 className="title">{movie.title}</h3>
          ) : null}

          <Stars value={review.rating} />

          {review.title && <div className="subtitle">{review.title}</div>}
          {review.body && <p className="body">{review.body}</p>}

          <div className="by">
            {review.user?.name || review.user_name || ""}
            {review.user?.email || review.user_email ? (
              <>  {review.user?.email || review.user_email}</>
            ) : null}
            {" · "}
            {new Date(review.createdAt).toLocaleDateString()}
          </div>
        </div>
      </article>
      
      <ReviewToGroup 
        review={review} 
        movie={movie} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
}
