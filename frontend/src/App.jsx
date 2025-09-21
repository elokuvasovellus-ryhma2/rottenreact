import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import { Layout } from './shared/components/Layout';
import { Home } from './features/home/Home';
import { Reviews } from './features/reviews/Reviews';
import { Favorites } from './features/favorites/Favorites';
import { Groups } from './features/groups/Groups';
import { Showtimes } from './features/showtimes/Showtimes';
import { Movie_seach_results } from './features/movie_search_results/Movie_seach_results';
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
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/showtimes" element={<Showtimes />} />
            <Route path="/movies_search_result" element={<Movie_seach_results />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;