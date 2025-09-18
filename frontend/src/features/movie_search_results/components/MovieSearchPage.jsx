import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AllMovies from './AllMovies';
import './MovieSearchPage.css';

export default function MovieSearchPage() {
  const [params] = useSearchParams();
  const query    = params.get('query') || '';
  const year     = params.get('year')  || '';
  const genre    = params.get('genre') || '';

  return (
    <div className="movie-search-page">
      <h2>Search results for “{query || 'all movies'}”</h2>
      <AllMovies
        query={query}
        year={year}
        genre={genre}
        initialPage={1}
      />
    </div>
  );
}