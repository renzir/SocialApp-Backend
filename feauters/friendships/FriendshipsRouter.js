const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../../Middleware/AuthMiddleware.js");
const sendFriendRequestController = require("./Controller/SendFriendRequestController.js");

router.get("/sendFriend", AuthMiddleware, sendFriendRequestController);

module.exports = router;
