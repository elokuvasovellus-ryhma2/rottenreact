import { Router } from "express";
import { createGroup, getUserGroups } from "./GroupController.js";

const router = Router();

router.post("/create", createGroup);
router.get("/user-groups/:userId", getUserGroups);

export default router;
