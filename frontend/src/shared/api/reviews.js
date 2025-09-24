import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  headers: { "Content-Type": "application/json" }
});

// Muunna snake_case -> camelCase, ja anna samat kentät kuin mockissa
const normalize = (r) => ({
  id: r.id,                           // käytetään kortin key:ssä
  movieId: r.movie_id,
  rating: r.rating,
  title: r.title ?? null,
  body: r.body ?? "",
  createdAt: r.created_at,            // mock käytti createdAt
  user: r.user || null,               // jos backendi palauttaa user-objektin myöhemmin
});

export async function fetchLatestReviews({ limit = 24, sort = "new" } = {}) {
  // sovita sort backendin odottamaan muotoon
  const sortMap = {
    new: "created_at.desc",
    rating: "rating.desc",
    title: "title.asc",
  };
  const res = await api.get(`/api/reviews`, {
    params: { limit, sort: sortMap[sort] ?? sortMap.new },
  });
  return Array.isArray(res.data) ? res.data.map(normalize) : [];
}

export async function createReview(payload) {
  const res = await api.post(`/api/reviews`, payload);
  return normalize(res.data);
}
