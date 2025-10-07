import React, { useEffect, useState } from "react";
import "./ReviewToGroup.css";

function Stars({ value = 0 }) {
  const full = Math.round(value);
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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groupId: groupId,
        movieId: movieId,
        reviewId: reviewId,
        userId: userId
      })
    });

    if (response.ok) {
      alert('Review pinned to group successfully!');
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.error || 'Failed to pin review to group'}`);
    }
  } catch (error) {
    console.error('Error pinning review to group:', error);
    alert('Error pinning review to group');
  }
}

export default function ReviewToGroup({ review, movie, isOpen, onClose }) {
  
  if (!isOpen) return null;

  const API = import.meta.env.VITE_API_URL;
  const userId = (() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "null")?.id ?? null; }
    catch { return null; }
  })();

  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch user's groups when component mounts
  useEffect(() => {
    if (!userId) return;
    fetchUserGroups();
  }, [userId]);

  const fetchUserGroups = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/Group/user-every-group/${userId}`);
      const data = await res.json();
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
        
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose} >&times;</button>
      
        
        <div className="modal-header">
          <h2 className="modal-title">
            {movie?.title || `Movie #${review.movieId}`}
          </h2>
          <h6> eli movieId = {review.movieId} ja tämä on review.id = {review.id}</h6>
          <Stars value={review.rating} />
        </div>

        {movie?.poster_path && (
          <div className="modal-poster">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie?.title}
            />
          </div>
        )}

        <div className="modal-body">
          {review.title && <h3 className="modal-subtitle">{review.title}</h3>}
          {review.body && <p className="modal-review-text">{review.body}</p>}
          
          <div className="modal-meta">
            <div className="modal-author">
              <strong>Review by:</strong> {review.user?.name || review.user_name || "Anonymous"}
            </div>
            <div className="modal-email">
              {review.user?.email || review.user_email}
            </div>
            <div className="modal-date">
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Group-related actions can be added here */}
          <div className="group-actions">
            <h4>Group Actions</h4>



            <div className="action-buttons">
              {/* Select group */}
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
                  groups.map(group => {
                    return <option key={group.id} value={group.id}>{group.name}</option>
                  })
                )}
              </select>
              
              <button 
                className="action-btn primary" 
                onClick={() => {
                  if (selectedGroupId) {
                    handleShareToGroup(review.id, selectedGroupId, review.movieId, userId);
                  } else {
                    alert('Please select a group first');
                  }
                }}
                disabled={!selectedGroupId || loading || groups.length === 0}
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
