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
      .catch(() => setErr("Failed to load reviews"))
      .finally(() => setLoading(false));
    return () => { ignore = true; };
  }, [sort, movieId]);

  const sorted = useMemo(() => {
    if (sort === "rating") return [...items].sort((a,b)=>b.rating-a.rating);
    if (sort === "title")  return [...items].sort((a,b)=>(a.title||"").localeCompare(b.title||""));
    return [...items].sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  }, [items, sort]);

 
  return (
    <div className="reviews-page">
      <header className="header">
        {heading ? <h1>{heading}</h1> : <span />}
        <label className="sort">
          Sort by{" "}
          <select value={sort} onChange={e => setSort(e.target.value)}>
            {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </header>

      {loading && <p>Loading…</p>}
      {err && <p className="error">{err}</p>}
      {!loading && !sorted.length && <p>No reviews yet.</p>}

      <section className="grid">
        {sorted.map(r => (
          <ReviewCard key={r.id} review={r} showPoster={showPosters} />
        ))}
      </section>
    </div>
  );
}

export default Reviews;