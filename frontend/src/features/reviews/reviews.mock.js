// Pieni viive, että näet lataustilan
const wait = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * @typedef {Object} Review
 * @property {string} _id
 * @property {string} movieId   // TMDB id myöhemmin
 * @property {number} rating    // 1..5
 * @property {string} title
 * @property {string} body 
 * @property {{name:string}} user 
 * @property {string} createdAt 
 */

// Feikki data
const MOCK = Array.from({ length: 18 }).map((_, i) => ({
  _id: String(i + 1),
  movieId: ['550','603','27205','11','680'][i % 5], 
  rating: [5,4,3,4,5][i % 5],
  title: ['Comment'],
  body: 'Here is the place where you can leave comment about the movie',
  user: { name: ['User1','User2','User3','User4'][i % 4] },
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

/**
 * Hae "uusimmat" arvostelut mock-datasta
 * @param {{limit?:number, sort?:'new'|'rating'|'title'}} opts
 * @returns {Promise<Review[]>}
 */
export async function fetchLatestReviews({ limit = 24, sort = 'new' } = {}) {
  await wait(400);
  let list = [...MOCK];

  if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  else if (sort === 'title') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return list.slice(0, limit);
}
