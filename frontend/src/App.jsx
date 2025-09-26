import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import { Layout } from './shared/components/Layout';
import { Home } from './features/home/Home';
import { Reviews } from './features/reviews/Reviews';
import FavoritesPage from './features/favorites/Favorites.jsx';
import { Groups } from './features/groups/Groups';
import { Showtimes } from './features/showtimes/Showtimes';
import  MovieDetail  from './features/movie_search_results/components/MovieDetail';
import  MovieSearchPage from './features/movie_search_results/components/MovieSearchPage.jsx';
import SignIn from "./features/Auth/SignIn";
import SignUp from "./features/Auth/SignUp";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/showtimes" element={<Showtimes />} />
            <Route path="/search" element={<MovieSearchPage />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;