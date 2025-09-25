import { HomeExampleComponent } from './components/HomeExampleComponent';
import MovieSearch from './components/MoviesSearch';
import LatestReviewsRow from './components/LatestReviewsRow';

export function Home() {
  return (
    <div className="home-page">

      <div className="featured-content">
        <MovieSearch />
        <HomeExampleComponent />
        <LatestReviewsRow />
      </div>
    </div>
  );
}
