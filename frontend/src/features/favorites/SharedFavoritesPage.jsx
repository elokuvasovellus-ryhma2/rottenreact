import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./FavoritesPage.css";

const IMG = (path, size = "w185") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export default function SharedFavoritesPage() {
  const { token: raw } = useParams();
  const shareToken = decodeURIComponent(raw || "");
  const TMDB = import.meta.env.VITE_TMDB_TOKEN;

  const [meta, setMeta] = useState(null);    
  const [items, setItems] = useState([]);    
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/favorites/shared/${encodeURIComponent(shareToken)}`
        );
        if (!res.ok) throw new Error("Not found");
        const data = await res.json(); 
        if (!alive) return;
        setMeta(data.list || null);
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (!alive) return;
        setErr("Shared list not found or is no longer public.");
        setMeta(null);
        setItems([]);
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [shareToken]);

  
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!items.length) { setDetails([]); return; }
      const ids = [...new Set(items.map(x => String(x.movie_id)))];
      const results = await Promise.allSettled(
        ids.map(id =>
          fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, {
            headers: { Authorization: `Bearer ${TMDB}`, accept: "application/json" },
          }).then(r => r.ok ? r.json() : Promise.reject(r.status))
        )
      );
      const ok = results
        .map((r, i) => r.status === "fulfilled" ? { ...r.value, _id: ids[i] } : null)
        .filter(Boolean);
      if (alive) setDetails(ok);
    })();
    return () => { alive = false; };
  }, [items, TMDB]);

  if (loading) return <p style={{ padding: 16 }}>Loading…</p>;
  if (err) return <p style={{ padding: 16 }}>{err}</p>;
  if (!meta) return <p style={{ padding: 16 }}>Nothing to show.</p>;

  return (
    <div className="favorites-page">
      <div className="right-panel" style={{ width: "100%" }}>
        <h2>Movies in: {meta.name}</h2>
        {details.length === 0 && <p>No movies in this list.</p>}
        <div className="fav-grid">
          {details.map(m => (
            <div key={m._id} className="movie-card">
              <a href={`/movies/${m.id}`} className="poster-wrap">
                {IMG(m.poster_path) ? (
                  <img className="poster" src={IMG(m.poster_path, "w185")} alt={m.title} />
                ) : <div className="poster ph" />}
              </a>
              <div className="meta">
                <h3 className="title"><a href={`/movies/${m.id}`}>{m.title}</a></h3>
                <div className="sub">
                  {m.release_date ? new Date(m.release_date).toLocaleDateString() : "—"}{" · "}
                  {typeof m.vote_average === "number" ? m.vote_average.toFixed(1) : "—"}/10
                </div>
                {m.overview ? <p className="overview">{m.overview}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
