import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import { Layout } from './shared/components/Layout';
import { Home } from './features/home/Home';
import { Reviews } from './features/reviews/Reviews';
import { Favorites } from './features/favorites/Favorites';
import { Groups } from './features/groups/Groups';
import { Showtimes } from './features/showtimes/Showtimes';

import  MovieDetail  from './features/movie_search_results/components/MovieDetail';

import  MovieSearchPage from './features/movie_search_results/components/MovieSearchPage.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/showtimes" element={<Showtimes />} />
            <Route path="/search" element={<MovieSearchPage />} />
            <Route path="/movies/:id" element={<MovieDetail />} />

          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;