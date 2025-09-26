import { useState } from "react";
import "./StarRatingInput.css";

export default function StarRatingInput({ value = 0, onChange }) {
  const [hover, setHover] = useState(0);

  
  const shown = value;

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
            if (e.key === "ArrowLeft")  set(Math.max(1, (value || 1) - 1));
          }}
          className={`star ${v <= shown ? "on" : ""} ${hover === v ? "hover" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
