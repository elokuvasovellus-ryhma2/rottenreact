// src/features/home/Home.jsx
import MovieSearch from './components/MoviesSearch';
import LatestReviewsRow from './components/LatestReviewsRow';
import InTheatresNow from './components/InTheatresNow';
import './Home.css';

export function Home() {
  return (
    <div className="home">
      <section className="section">
        
        <MovieSearch />
      </section>

      <section className="section">
        
        {}
        <InTheatresNow speed={0.8} limit={100} />
      </section>

      <section className="section">
        
        <LatestReviewsRow />
      </section>
    </div>
  );
}
