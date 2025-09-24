import { useState } from "react";

export default function StarRatingInput({ value = 0, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value; 

  const set = (v) => onChange?.(v);

  return (
    <div role="radiogroup" aria-label="Rating 1–5" className="stars-input">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          title={`${v} / 5`}
          onMouseEnter={() => setHover(v)}
          onMouseLeave={() => setHover(0)}
          onFocus={() => setHover(v)}
          onBlur={() => setHover(0)}
          onClick={() => set(v)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") set(Math.min(5, (value || 0) + 1));
            if (e.key === "ArrowLeft") set(Math.max(1, (value || 1) - 1));
          }}
          className={`star ${v <= shown ? "on" : ""}`}
        >
          ★
        </button>
      ))}
      <style>{`
        .stars-input { display:inline-flex; gap:8px; }
        .star {
          cursor:pointer; font-size:24px; line-height:1;
          background:transparent; border:none; padding:0;
          color:#555; transition: transform .06s ease, color .2s ease;
        }
        .star.on { color:#ffd04d; }
        .star:hover { transform: scale(1.08); }
        .star:focus { outline:2px solid #3b82f6; outline-offset:2px; }
      `}</style>
    </div>
  );
}
