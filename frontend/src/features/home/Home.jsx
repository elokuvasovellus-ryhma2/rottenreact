import { ExampleComponent } from '../../shared/components/ExampleComponent.jsx';
import { HomeExampleComponent } from './components/HomeExampleComponent';

export function Home() {
  return (
    <div className="home-page">
      <h1>Welcome to RottenReact</h1>
      <p>Your ultimate movie review platform</p>
      <div className="featured-content">
        <h2>Featured Movies</h2>
        <p>Discover the latest and greatest films</p>
        <ExampleComponent />
        <HomeExampleComponent />
      </div>
    </div>
  );
}
