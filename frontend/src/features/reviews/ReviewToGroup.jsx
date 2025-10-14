import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";        
import "./ReviewToGroup.css";

function Stars({ value = 0 }) {
  const full = Math.round(Number(value) || 0);
  return (
    <div className="stars" aria-label={`Rating ${full}/5`} style={{ margin: "0px 40px 0px 0px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? "star on" : "star off"}>★</span>
      ))}
    </div>
  );
}

async function handleShareToGroup(reviewId, groupId, movieId, userId) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/group-pinned-movies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, movieId, reviewId, userId }),
    });

    if (response.ok) {
      alert("Review pinned to group successfully!");
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.error || "Failed to pin review to group"}`);
    }
  } catch (error) {
    console.error("Error pinning review to group:", error);
    alert("Error pinning review to group");
  }
}

export default function ReviewToGroup({ review, movie, isOpen, onClose }) {
  
  if (!isOpen || (!review && !movie)) return null;

  const API = import.meta.env.VITE_API_URL;
  const userId = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null")?.id ?? null;
    } catch {
      return null;
    }
  })();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [groups, setGroups] = useState([]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedGroupId, setSelectedGroupId] = useState("");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!userId) return;
    (async function fetchUserGroups() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/Group/user-every-group/${userId}`);
        const data = await res.json();
        setGroups(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching user groups:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, API]);

  
  const resolvedMovieId =
    movie?.id ?? movie?.movie_id ?? review?.movieId ?? review?.movie_id ?? null;

  const movieTitle =
    movie?.title ??
    (review ? `Movie #${review.movieId ?? review?.movie_id ?? ""}` : "Movie");

  const createdAt = review?.createdAt || review?.created_at || null;
  const createdAtStr = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        {}
        <div className="modal-header">
          <h2 className="modal-title">{movieTitle}</h2>
          {review && (
            <h6>
              eli movieId = {review.movieId ?? review.movie_id} ja tämä on review.id = {review.id}
            </h6>
          )}
          <Stars value={review?.rating || 0} />
        </div>

        {movie?.poster_path && (
          <div className="modal-poster">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie?.title || "Poster"}
            />
          </div>
        )}

        <div className="modal-body">
          {}
          {(review?.title || resolvedMovieId) && (
            <div className="modal-subheader">
              {review?.title ? (
                <h3 className="modal-subtitle">{review.title}</h3>
              ) : (
                <div /> 
              )}
              {resolvedMovieId && (
                <Link
                  to={`/movies/${String(resolvedMovieId)}`}
                  onClick={onClose}
                  className="action-btn secondary small"
                  role="button"
                >
                  Movie details
                </Link>
              )}
            </div>
          )}

          {review?.body && <p className="modal-review-text">{review.body}</p>}

          <div className="modal-meta">
            <div className="modal-author">
              <strong>Review by:</strong>{" "}
              {review?.user?.name || review?.user_name || "Anonymous"}
            </div>
            <div className="modal-email">
              {review?.user?.email || review?.user_email || ""}
            </div>
            <div className="modal-date">{createdAtStr}</div>
          </div>

          <div className="group-actions">
            <h4>Group Actions</h4>
            <div className="action-buttons">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                disabled={loading}
              >
                <option value="" disabled>
                  {loading ? "Loading groups..." : "Choose a group..."}
                </option>
                {groups.length === 0 && !loading ? (
                  <option value="" disabled>No groups available</option>
                ) : (
                  groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))
                )}
              </select>

              <button
                className="action-btn primary"
                onClick={() => {
                  if (!selectedGroupId) return alert("Please select a group first");
                  if (!review?.id || !resolvedMovieId)
                    return alert("Missing review/movie id");
                  handleShareToGroup(review.id, selectedGroupId, resolvedMovieId, userId);
                }}
                disabled={!selectedGroupId || loading || groups.length === 0 || !review?.id}
              >
                {loading ? "Loading..." : "Pin Review to Group"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}