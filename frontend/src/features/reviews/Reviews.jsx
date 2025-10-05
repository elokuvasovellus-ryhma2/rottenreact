import { useEffect, useMemo, useState } from "react";
import { fetchLatestReviews } from "../../shared/api/reviews";
import ReviewCard from "./ReviewCard";
import "./Reviews.css";

const SORTS = [
  { id: "new",    label: "Newest" },
  { id: "rating", label: "Rating" },
  { id: "title",  label: "Title"  },
];

export function Reviews({ movieId, heading = "Reviews", showPosters = true }) {
  const [sort, setSort] = useState("new");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true); setErr("");
    fetchLatestReviews({ limit: 24, sort, movieId })
      .then(rows => { if (!ignore) setItems(rows); })
      .catch(() => { if (!ignore) setErr("Failed to load reviews"); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [sort, movieId]);

  
  useEffect(() => {
    const onCreated = (e) => {
      const r = e.detail;
      if (!r) return;

      const rMovieId = String(r.movieId ?? r.movie_id ?? "");
      if (rMovieId !== String(movieId)) return;

      const normalized = {
        id: r.id ?? `temp-${Date.now()}`,
        movieId: rMovieId,
        rating: Number(r.rating ?? 0),
        title: r.title ?? "",
        body: r.body ?? "",
        createdAt: r.createdAt ?? r.created_at ?? new Date().toISOString(),
        
        user: r.user || {
          email: r.user_email ?? r.userEmail ?? "",
          name:  r.user_name  ?? r.userName  ?? "",
        },
        user_email: r.user_email ?? r.userEmail ?? r.user?.email ?? "",
        user_name:  r.user_name  ?? r.userName  ?? r.user?.name  ?? "",
      };

      setItems(prev => [normalized, ...prev]);
    };

    window.addEventListener("review:created", onCreated);
    return () => window.removeEventListener("review:created", onCreated);
  }, [movieId]);

  const sorted = useMemo(() => {
    if (sort === "rating")
      return [...items].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    if (sort === "title")
      return [...items].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [items, sort]);

  return (
    <div className="reviews-page">
      <header className="header">
        {heading ? <h1>{heading}</h1> : <span />}
        <label className="sort">
          Sort by{" "}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
      </header>

      {loading && <p>Loading…</p>}
      {!loading && err && <p className="error">{err}</p>}
      {!loading && !sorted.length && <p>No reviews yet.</p>}

      <section className="grid">
        {sorted.map((r) => (
          <ReviewCard key={r.id} review={r} showPoster={showPosters} />
        ))}
      </section>
    </div>
  );
}

export default Reviews;
