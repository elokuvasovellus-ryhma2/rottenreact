import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./MovieDetail.css";
import ReviewForm from "../../reviews/ReviewForm";
import { Reviews } from "../../reviews/Reviews";
import { AddToFavoritesButton } from "./AddToFavoritesButton";

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = import.meta.env.VITE_TMDB_TOKEN;

 
  const getUser = () => {
    const userStr = sessionStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };
  const user = getUser();
  const userId = user?.id;

  
  const [providers, setProviders] = useState(null);
  const [provLoading, setProvLoading] = useState(true);
  const [provErr, setProvErr] = useState("");

  
  const region = React.useMemo(() => {
    try {
      const lang = navigator.language || "fi-FI";
      const parts = String(lang).split("-");
      return (parts[1] || "FI").toUpperCase();
    } catch {
      return "FI";
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
          { headers: { Authorization: `Bearer ${token}`, accept: "application/json" } }
        );
        if (!res.ok) throw new Error(`Virhe haussa: ${res.status}`);
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error("Fetch MovieDetail error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  
  useEffect(() => {
    if (!id) {
      setProviders(null);
      setProvLoading(false);
      return;
    }
    let ignore = false;
    setProvLoading(true);
    setProvErr("");

    (async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/watch/providers`,
          { headers: { Authorization: `Bearer ${token}`, accept: "application/json" } }
        );
        if (!res.ok) throw new Error(`providers status ${res.status}`);
        const data = await res.json();
        const r = data?.results?.[region] || null;

        const shaped = {
          region,
          link: r?.link || null,
          flatrate: r?.flatrate || [],
          rent: r?.rent || [],
          buy: r?.buy || [],
          free: r?.free || [],
          ads: r?.ads || [],
        };
        if (!ignore) setProviders(shaped);
      } catch (e) {
        if (!ignore) {
          console.error("Watch providers error:", e);
          setProvErr("Watch providers unavailable");
          setProviders(null);
        }
      } finally {
        if (!ignore) setProvLoading(false);
      }
    })();

    return () => { ignore = true; };
  }, [id, token, region]);

  if (loading) return <p>Loading...</p>;
  if (!movie) return <p>Movie not found</p>;

  const { title, poster_path, release_date, overview, vote_average } = movie;

  
  const logoUrl = (path, w = 45) => (path ? `https://image.tmdb.org/t/p/w${w}${path}` : "");

  
  const providerGroups = [
    { key: "flatrate", label: "Streaming" },
    { key: "rent",     label: "Rent" },
    { key: "buy",      label: "Buy" },
    { key: "free",     label: "Free" },
    { key: "ads",      label: "With ads" },
  ];

  const hasAnyProviders = providers
    ? providerGroups.some(g => (providers[g.key] || []).length)
    : false;

  return (
    <div className="movie-detail">
      {}
      <div className="movie-header">
        <div className="poster-wrap">
          {poster_path ? (
            <img
              className="movie-poster"
              src={`https://image.tmdb.org/t/p/w300${poster_path}`}
              alt={title}
            />
          ) : (
            <div className="poster-ph" />
          )}
        </div>

        <div className="movie-info">
          <h1 className="movie-title">{title}</h1>

          <div className="movie-meta">
            <span className="badge">
              <strong>Release:</strong> {release_date || "—"}
            </span>
            <span className="badge">
              <strong>Rating:</strong>{" "}
              {typeof vote_average === "number" ? vote_average.toFixed(1) : "–"}/10
            </span>
          </div>

          {overview ? (
            <p className="movie-overview">{overview}</p>
          ) : (
            <p className="movie-overview">No description available.</p>
          )}

          {}
          <section className="watch-providers">
            <h2 className="section-title">Where to watch</h2>

            {provLoading && <p className="providers-loading">Loading providers…</p>}
            {!provLoading && provErr && (
              <p className="providers-error">{provErr}</p>
            )}
            {!provLoading && !provErr && providers && (
              <>
                {!hasAnyProviders ? (
                  <p className="providers-empty">No providers in {providers.region}.</p>
                ) : (
                  providerGroups.map(({ key, label }) => {
                    const arr = providers[key] || [];
                    if (!arr.length) return null;
                    return (
                      <div className="wp-row" key={key}>
                        <span className="wp-label">{label}</span>
                        <div className="wp-logos">
                          {arr.map(p => (
                            <a
                              key={p.provider_id}
                              className="wp-chip"
                              href={providers.link || "#"}
                              target="_blank"
                              rel="noreferrer"
                              title={p.provider_name}
                            >
                              <img
                                src={logoUrl(p.logo_path, 45)}
                                alt={p.provider_name}
                                loading="lazy"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </section>

          <div className="actions">
            <AddToFavoritesButton userId={userId} movieId={id} />
          </div>
        </div>
      </div>

      <h2 className="section-title">Review this movie</h2>
      <ReviewForm movieId={id} />

      <Reviews movieId={id} heading="" showPosters={false} showMovieTitle={false} />
    </div>
  );
}
