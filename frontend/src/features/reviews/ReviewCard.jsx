import React, { useEffect, useState } from 'react';

function Stars({ value = 0 }) {
  const full = Math.round(value);
  return (
    <div aria-label={`Rating ${full}/5`} style={{ letterSpacing: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < full ? '#ffd04d' : '#444' }}>★</span>
      ))}
    </div>
  );
}

export default function ReviewCard({ review, showPoster = true }) {
  const [movie, setMovie] = useState(null);
  const token = import.meta.env.VITE_TMDB_TOKEN;

  useEffect(() => {
    if (!showPoster) return;
    let alive = true;
    if (!review.movieId) return;
    (async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${review.movieId}?language=en-US`,
          { headers: { Authorization: `Bearer ${token}`, accept: 'application/json' } }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setMovie(data);
      } catch {}
    })();
    return () => { alive = false; };
  }, [review.movieId, token, showPoster]);

  return (
    <article className="review-card">
      {showPoster && (
        <div className="poster" aria-hidden>
          {movie?.poster_path
            ? <img
                src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                alt={movie?.title}
                style={{ width:'100%', height:'100%', objectFit:'cover' }}
              />
            : <div className="ph" />
          }
        </div>
      )}

      <div className="meta">
        <h3 className="title">
          {showPoster ? (movie?.title || `Movie #${review.movieId}`) : ' '}
        </h3>
        <Stars value={review.rating} />
        {review.title && <div className="subtitle">{review.title}</div>}
        {review.body && <p className="body">{review.body}</p>}
        <div className="by">
          {review.user?.name || review.user_name || 'User'}
          {review.user?.email || review.user_email ? (
            <> · {review.user?.email || review.user_email}</>
          ) : null}
          {' · '}
          {new Date(review.createdAt).toLocaleDateString()}
        </div>
      </div>

      <style>{`
        .review-card {
          display:grid; grid-template-rows:auto 1fr; gap:.5rem;
          border:1px solid #2b2b2b; border-radius:12px; padding:.75rem; background:#111;
        }
        .poster { width:100%; aspect-ratio:2/3; border-radius:8px; overflow:hidden; }
        .ph { width:100%; height:100%; background:#1f1f1f; }
        .title { font-weight:600; margin:.25rem 0; color:#eee; }
        .subtitle { font-weight:500; margin:.25rem 0; color:#e5e7eb; }
        .body { color:#cbd5e1; margin:.25rem 0; }
        .by { color:#9ca3af; font-size:.85rem; margin-top:.25rem; }
      `}</style>
    </article>
  );
}
