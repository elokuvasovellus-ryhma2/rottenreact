const express = require('express');
const ReviewController = require('./reviewController');

// review routes

// reviewRoutes.js
// ------------------------------
// TÄMÄ TIEDOSTO:
// - Määrittelee URL-polut ja kytkee middlewaret sekä controllerin. Tarviiko olla kirjautunut?
// - Ei sisällä logiikkaa eikä SQL:ää.
// - Rekisteröidään serverissä: app.use("/api/reviews", reviewRoutes)