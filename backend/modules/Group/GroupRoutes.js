import { Router } from "express";
import { createGroup, getUserGroups, getUserEveryGroup,leaveGroup, getGroupsWhereAdmin , deleteGroupIfAdmin,requestToJoin,listPendingForGroup, approveJoin, rejectJoin, getMembersOfGroupIfAdmin, removeFromGroupIfAdmin } from "./GroupController.js";
const router = Router();

router.post("/create", createGroup);
router.get("/user-groups/:userId", getUserGroups);
router.get("/user-every-group/:userId", getUserEveryGroup);
router.delete("/leave-group/:userId/:groupId", leaveGroup);
router.get("/get-groups-where-admin/:userId", getGroupsWhereAdmin);
router.delete("/delete-group-if-admin/:groupId/:userId", deleteGroupIfAdmin);
router.post("/join/request", requestToJoin);
router.get("/join/pending/:groupId", listPendingForGroup);
router.post("/join/approve", approveJoin);
router.post("/join/reject", rejectJoin);
router.get("/get-members/:groupId", getMembersOfGroupIfAdmin);
router.post("/remove-member/:groupId/:userId", removeFromGroupIfAdmin);

export default router;
