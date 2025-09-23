import { pool } from '../../config/database.js';

//class ReviewModel {

// reviewModel.js
// ------------------------------
// TÄMÄ TIEDOSTO:
// - Sisältää VAIN tietokantakyselyt (SQL) arvosteluihin liittyen.
// - Ei tee HTTP- eikä oikeustarkistuksia (ei req/res, ei JWT-tarkistuksia).
// - Palauttaa puhdasta dataa (riv(i)tä) tai null.
// ------------------------------