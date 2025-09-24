import { useState } from "react";
import { createReview } from "../../shared/api/reviews";
import { useAuth } from "../../shared/contexts/AuthContext";
import StarRatingInput from "../../features/movie_search_results/components/StarRatingInput";

export default function ReviewForm({ movieId }) {
  const { user, isLoggedIn } = useAuth();
  const [rating, setRating] = useState(0);      
  const [title, setTitle]   = useState("");
  const [body, setBody]     = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");
  const [ok, setOk]         = useState("");

  if (!isLoggedIn) return <p>Sign In to write movie review.</p>;

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true); setErr(""); setOk("");
    try {
      await createReview({
        movie_id: String(movieId),
        user_id: user?.id ?? null, 
        rating,                    
        title,
        body,
      });
      setTitle(""); setBody(""); setRating(0);
      setOk("Reviewed successfully");
    } catch (e) {
      
      const server = e?.response?.data;
      const msg = server?.message || server?.error || e?.message || "Error while submitting";
      setErr(msg);
      console.error("createReview failed:", e?.response || e);
    } finally {
      setSaving(false);
    }
  }

  const disabled = saving || rating < 1; 

  return (
    <form onSubmit={onSubmit} className="review-form">
      {err && <div className="rf-error">{err}</div>}
      {ok  && <div className="rf-ok">{ok}</div>}

      <div className="rf-grid">
        <label className="rf-label">
          Rating
          <StarRatingInput value={rating} onChange={setRating} />
        </label>

        <label className="rf-label">
          Title
          <input placeholder="Title (optional)" value={title} onChange={e=>setTitle(e.target.value)} />
        </label>

        <label className="rf-label">
          Review
          <textarea rows={4} placeholder="Write your review…" value={body} onChange={e=>setBody(e.target.value)} />
        </label>

        <button disabled={disabled} type="submit" className="rf-btn">
          {saving ? "Saving…" : "Submit"}
        </button>
      </div>

      <style>{`
        .review-form { margin:1rem 0; }
        .rf-error { color:#ef4444; margin-bottom:.5rem; }
        .rf-ok    { color:#22c55e; margin-bottom:.5rem; }
        .rf-grid { display:grid; gap:.75rem; max-width:560px; }
        .rf-label { display:grid; gap:.35rem; color:#ddd; }
        .rf-label input, .rf-label textarea {
          width:100%; border:1px solid #2b2b2b; background:#151515; color:#f3f3f3;
          border-radius:8px; padding:.6rem .75rem;
        }
        .rf-label input::placeholder, .rf-label textarea::placeholder { color:#8a8a8a; }
        .rf-label input:focus, .rf-label textarea:focus {
          outline:none; border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.25);
        }
        .rf-btn {
          background:#0ea5e9; color:#0b0b0b; font-weight:600; border:none;
          border-radius:10px; padding:.6rem 1rem; cursor:pointer; width:fit-content;
        }
        .rf-btn[disabled] { opacity:.6; cursor:not-allowed; }
      `}</style>
    </form>
  );
}