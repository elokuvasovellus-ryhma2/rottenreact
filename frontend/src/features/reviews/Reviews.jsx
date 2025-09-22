import { useEffect, useMemo, useState } from 'react';

import { fetchLatestReviews } from './reviews.mock'; //testi api, joka 
import ReviewCard from './ReviewCard';

const SORTS = [
  { id: 'new', label: 'Newest' },
  { id: 'rating', label: 'Rating' },
  { id: 'title', label: 'Title' },
];

export function Reviews() {
  const [sort, setSort] = useState('new');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true); setErr('');
    fetchLatestReviews({ limit: 24, sort })
      .then((rows) => { if (!ignore) setItems(rows); })
      .catch(() => setErr('Failed to load reviews'))
      .finally(() => setLoading(false));
    return () => { ignore = true; };
  }, [sort]);

  const sorted = useMemo(() => {
    if (sort === 'rating') return [...items].sort((a,b)=>b.rating-a.rating);
    if (sort === 'title')  return [...items].sort((a,b)=>(a.title||'').localeCompare(b.title||''));
    return [...items].sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  }, [items, sort]);

  return (
    <div className="reviews-page">
      <header className="header">
        <h1>Reviewed movies</h1>
        <label className="sort">
          Sort by{' '}
          <select value={sort} onChange={e => setSort(e.target.value)}>
            {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </header>

      {loading && <p>Loading…</p>}
      {err && <p className="error">{err}</p>}
      {!loading && !sorted.length && <p>No reviews yet.</p>}

      <section className="grid">
        {sorted.map(r => <ReviewCard key={r._id} review={r} />)}
      </section>

      <style>{`
        .reviews-page { max-width:1100px; margin:0 auto; padding:1rem; }
        .header { display:flex; align-items:center; justify-content:space-between;
                  border-bottom:1px solid #e5e7eb; padding:.75rem 0; margin-bottom:1rem; }
        h1 { font-size:2rem; font-weight:700; margin:0; }
        .sort select { margin-left:.5rem; }
        .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap:1rem; }
        .error { color:#b91c1c; }
      `}</style>
    </div>
  );
}

export default Reviews;
