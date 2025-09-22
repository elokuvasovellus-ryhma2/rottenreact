function Stars({ value = 0 }) {
  const full = Math.round(value);
  return (
    <div aria-label={`Rating ${full}/5`} style={{ letterSpacing: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < full ? '#111827' : '#c7c7c7' }}>★</span>
      ))}
    </div>
  );
}

export default function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <div className="poster" aria-hidden>
        {/* Placeholder-kuva rungolle. TMDB-posteri lisätään myöhemmin. */}
        <div className="ph" />
      </div>
      <div className="meta">
        <h3 className="title">Movie #{review.movieId}</h3>
        <Stars value={review.rating} />
        {review.title && <div className="subtitle">{review.title}</div>}
        {review.body && <p className="body">{review.body}</p>}
        <div className="by">
         {review.user?.name || 'Anonymous'}
          {' · '}
          {/* SÄHKÖPOSTI NÄKYVIIN */}
          {review.user?.email || 'email@example.com'}
          {' · '}
          {new Date(review.createdAt).toLocaleDateString()}
        </div>
      </div>

      <style>{`
        .review-card {
          display:grid; grid-template-rows:auto 1fr; gap:.5rem;
          border:1px solid #e5e7eb; border-radius:12px; padding:.75rem; background:#fff;
        }
        .poster { width:100%; aspect-ratio:2/3; border-radius:8px; overflow:hidden; }
        .ph { width:100%; height:100%; background:#e5e7eb; }
        .title { font-weight:600; margin:.25rem 0; }
        .subtitle { font-weight:500; margin:.25rem 0; color:#111827; }
        .body { color:#374151; margin:.25rem 0; }
        .by { color:#6b7280; font-size:.85rem; margin-top:.25rem; }
      `}</style>
    </article>
  );
}
