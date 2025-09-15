import { ExampleComponent } from '../../shared/components/ExampleComponent.jsx';
import { HomeExampleComponent } from './components/HomeExampleComponent';
import MovieSearch from './components/MoviesSearch';

export function Home() {
  return (
    <div className="home-page">

      <div className="featured-content">
        <MovieSearch />
        <HomeExampleComponent />
        <ExampleComponent />
      </div>
    </div>
  );
}
