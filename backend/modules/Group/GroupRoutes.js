import { Router } from "express";
import { createGroup, getUserGroups, getUserEveryGroup, leaveGroup, getGroupsWhereAdmin , deleteGroupIfAdmin,  } from "./GroupController.js";

const router = Router();

router.post("/create", createGroup);
router.get("/user-groups/:userId", getUserGroups);
router.get("/user-every-group/:userId", getUserEveryGroup);
router.delete("/leave-group/:userId/:groupId", leaveGroup);
router.get("/get-groups-where-admin/:userId", getGroupsWhereAdmin);
router.delete("/delete-group-if-admin/:groupId/:userId", deleteGroupIfAdmin);


export default router;
