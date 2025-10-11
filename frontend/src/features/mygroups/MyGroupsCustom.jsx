import { useEffect, useState } from "react";
import ReviewCard from "../reviews/ReviewCard";
import { finnkinoItemsAPI } from "../../shared/api/finnkinoItems.js";


export function MyGroupsCustom() {
  const API = import.meta.env.VITE_API_URL;
  const userId = (() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "null")?.id ?? null; }
    catch { return null; }
  })();

  const [groups, setGroups] = useState([]);   // [{id, name, ...}]
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [finnkinoItems, setFinnkinoItems] = useState([]);


  // Hae käyttäjän kaikki ryhmät
  useEffect(() => {
    if (!userId) return;
    fetchUserGroups();
  }, [userId]);

  // Fetch pinned reviews and finnkino items when a group is selected
  useEffect(() => {
    if (selectedGroup) {
      fetchReviewsFromGroup();
      fetchFinnkinoItems();
    } else {
      setReviews([]);
      setFinnkinoItems([]);
    }
  }, [selectedGroup]);

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


  const fetchReviewsFromGroup = async () => {
    if (!selectedGroup) return;
    try {
      const res = await fetch(`${API}/group-pinned-movies/${selectedGroup}`);
      const data = await res.json();
      setReviews(data || []);
      console.log('Pinned reviews:', data);
    } catch (error) {
      console.error('Error fetching pinned reviews:', error);
      setReviews([]);
    }
  };

  const fetchFinnkinoItems = async () => {
    if (!selectedGroup) return;
    try {
      const data = await finnkinoItemsAPI.getItems(selectedGroup);
      setFinnkinoItems(data || []);
      console.log('Finnkino items:', data);
    } catch (error) {
      console.error('Error fetching finnkino items:', error);
      setFinnkinoItems([]);
    }
  };

  return (
    <div style={{ color: "#255" }}>
      <h1>My Groups</h1>

      {loading ? (
        <p>Loading groups...</p>
      ) : groups.length === 0 ? (
        <p>You are not a member of any groups.</p>
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            <label>
              Select Group:&nbsp;
              <select
                value={selectedGroup || ""}
                onChange={(e) => setSelectedGroup(e.target.value)}
                style={{ color: "#000", background: "#fff", padding: "4px" }}
              >
                <option value="" style={{ color: "#000" }}>
                  Choose a group...
                </option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id} style={{ color: "#000" }}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginTop: "10px" }}>
            <h2>Reviews in Groups</h2>
            <h3>Group id : {selectedGroup}</h3>
            {reviews.length === 0 ? (
              <p>No pinned reviews in this group yet.</p>
            ) : (
              <div style={{ 
                display: "flex", 
                gap: "20px", 
                overflowX: "auto", 
                padding: "10px 0",
                alignItems: "flex-start"
              }}>
                {reviews.map((pinnedItem, index) => {
                  // Transform the pinned item data to match ReviewCard expected format
                  const reviewData = {
                    id: pinnedItem.review_id,
                    movieId: pinnedItem.movie_id,
                    title: pinnedItem.review_title,
                    body: pinnedItem.review_body,
                    rating: pinnedItem.review_rating,
                    createdAt: pinnedItem.review_created_at,
                    user: {
                      email: pinnedItem.added_by_email,
                      id: pinnedItem.added_by_user_id
                    }
                  };
                  
                  return (
                    <div key={`${pinnedItem.review_id}-${index}`} style={{ 
                      minWidth: "280px", 
                      border: "1px solid #ccc", 
                      padding: "15px", 
                      borderRadius: "8px",
                      backgroundColor: "red",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}>
                      <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#666" }}>
                        Pinned Review:
                      </h4>
                      <ReviewCard review={reviewData} />
                      <p style={{ 
                        fontSize: "12px", 
                        color: "#666", 
                        marginTop: "8px",
                        marginBottom: "0"
                      }}>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ marginTop: "20px" }}>
            <h2>Invites to finnkino movies</h2>
            {finnkinoItems.length === 0 ? (
              <p>No invites to finnkino movies in this group yet.</p>
            ) : (
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "15px", 
                padding: "10px 0"
              }}>
                {finnkinoItems.map((item) => {
                  let finnkinoData;
                  try {
                    finnkinoData = JSON.parse(item.display_text);
                  } catch {
                    // Fallback for simple text
                    finnkinoData = { movie: item.display_text };
                  }
                  
                  return (
                    <div key={item.id} style={{ 
                      border: "1px solid #ccc", 
                      padding: "15px", 
                      borderRadius: "8px",
                      backgroundColor: "#f9f9f9",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}>
                      <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
                        🎬 {finnkinoData.movie || 'Movie Invitation'}
                      </h4>
                      {finnkinoData.theatre && (
                        <p>
                          <strong>Theatre:</strong> {finnkinoData.theatre}
                          {finnkinoData.auditorium && ` (${finnkinoData.auditorium})`}
                        </p>
                      )}
                      {finnkinoData.showtime && (
                        <p>
                          <strong>Time:</strong> {new Date(finnkinoData.showtime).toLocaleString('fi-FI')}
                        </p>
                      )}
                      {finnkinoData.invitationText && (
                        <p>
                          <strong>Inivite message:</strong> {finnkinoData.invitationText}
                        </p>
                      )}
                       <p>
                        <strong>From user:</strong> {item.added_by_email}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          
        </>
      )}
    </div>
  );
}
