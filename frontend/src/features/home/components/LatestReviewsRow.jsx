import { useEffect, useRef, useState } from "react";
import { fetchLatestReviews } from "../../../shared/api/reviews";
import ReviewCard from "../../reviews/ReviewCard";
import "./LatestReviewsRow.css";

export default function LatestReviewsRow() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const scrollerRef = useRef(null);

  useEffect(() => {
    setLoading(true); setErr("");
    fetchLatestReviews({ limit: 12, sort: "new" })
      .then(rows => setItems(rows))
      .catch(() => setErr("Failed to load latest reviews"))
      .finally(() => setLoading(false));
  }, []);

  const scrollBy = (px) => scrollerRef.current?.scrollBy({ left: px, behavior: "smooth" });

  return (
    <section className="lrw">
      <div className="lrw__header">
        <h2>Latest reviews</h2>
        <div className="lrw__nav">
          <button className="lrw__btn" onClick={() => scrollBy(-400)} aria-label="Scroll left">‹</button>
          <button className="lrw__btn" onClick={() => scrollBy(400)} aria-label="Scroll right">›</button>
        </div>
      </div>

      {loading && <p className="lrw__status">Loading…</p>}
      {err && <p className="lrw__status lrw__status--err">{err}</p>}
      {!loading && !items.length && <p className="lrw__status">No reviews yet.</p>}

      <div className="lrw__scroller" ref={scrollerRef}>
        {items.map(r => (
          <div className="lrw__item" key={r.id}>
            <ReviewCard review={r} showPoster variant="compact" />
          </div>
        ))}
      </div>
    </section>
  );
}
