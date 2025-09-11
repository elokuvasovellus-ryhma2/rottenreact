import './App.css';
import MovieSearch from "./components/MovieSearch";
import AllMovies from "./components/AllMovies";

function App() {
  return (
    <div className="App">
      <h1>RottenReact 🍿 Elokuvahaku</h1>
      <MovieSearch />
      <AllMovies />
    </div>
  );
}

export default App;

