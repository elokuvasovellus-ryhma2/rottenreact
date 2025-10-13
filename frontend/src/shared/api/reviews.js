import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  headers: { "Content-Type": "application/json" }
});

const normalize = (r) => ({
  id: r.id,
  movieId: r.movie_id,
  rating: r.rating,
  title: r.title ?? null,
  body: r.body ?? "",
  createdAt: r.created_at,
  user: r.user || null,
});

export async function fetchLatestReviews({
  limit = 24,
  sort = "new",
  movieId,
  mine,           
  userEmail,     
} = {}) {
  const sortMap = {
    new: "created_at.desc",
    rating: "rating.desc",
    title: "title.asc",
  };
  const params = {
    limit,
    sort: sortMap[sort] ?? sortMap.new,
    ...(movieId !== undefined ? { movieId } : {}),
    ...(mine ? { mine: 1 } : {}),
    ...(userEmail ? { userEmail } : {}), 
  };
  const res = await api.get(`/api/reviews`, { params });
  return Array.isArray(res.data) ? res.data.map(normalize) : [];
}

export async function createReview(payload) {
  const res = await api.post(`/api/reviews`, payload);
  return normalize(res.data);
}
