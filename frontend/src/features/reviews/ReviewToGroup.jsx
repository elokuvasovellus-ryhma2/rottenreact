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

function handleShareToGroup() {
  alert("Backendiin reitti ja tämä toimivaksi");
}

export default function ReviewToGroup({ review, movie, isOpen, onClose }) {
  if (!isOpen) return null;

  const [groups, setGroups] = useState([]);

  // Test data for groups before API is ready
  const testGroups = [
    { id: 1, name: "ScifiKerho" },
    { id: 2, name: "LänkkäriKerho" },
    { id: 3, name: "KummeliMiesKerho" },
    { id: 4, name: "Clint EastwoodKerho" },
    { id: 5, name: "TarantinoKerho" }
  ];

  useEffect(() => {
    // Use test data for now, uncomment the API call when ready
    setGroups(testGroups);
    
    // fetch(`${import.meta.env.VITE_API_URL}/groups`)
    //   .then(res => res.json())
    //   .then(data => setGroups(data))
    //   .catch(err => console.error('Virhe ryhmien haussa:', err));
  }, []);


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
              <select defaultValue="">
                <option value="" disabled>Valitse ryhmä…</option>
                {
                  groups.map(group => {
                    return <option key={group.id} value={group.id}>{group.name}</option>
                  })
                }
              </select>
              
              <button className="action-btn primary" onClick={handleShareToGroup}>
                Share to Group
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
