import { Router } from "express";
import {
  createList,
  addMovie,
  getListMovies,
  getUserLists,
  getSharedList,       
  rotateShareUrl
} from "./favoritesController.js";

const router = Router();


router.post("/create", createList);


router.post("/add", addMovie);


router.get("/user-lists/:userId", getUserLists);


router.get("/list/:listId", getListMovies);


router.get("/shared/:token", getSharedList);


router.patch("/list/:listId/rotate-share", rotateShareUrl);

export default router;
