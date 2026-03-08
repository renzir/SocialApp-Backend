const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../../Middleware/AuthMiddleware.js");
const sendFriendRequestController = require("./Controller/SendFriendRequestController.js");
const AcceptFriendRequestController = require("./controller/AceptRequestController.js");
const cancelRequestController = require("./controller/CancelRequestController.js");
const blockUserController = require("./controller/blockUserController.js");
const checkFriendshipStatus = require("./middleware/checkFriendshipStatus.js");
const checkAcceptRequest = require("./middleware/checkAcceptRequest.js");
const checkCancelRequest = require("./middleware/checkCancelRequest.js");
const checkBlock = require("./middleware/checkBlock.js");
const checkUnblock = require("./middleware/CheckUnBlock.js");
const UnblockController = require("./controller/UnblockController.js");

router.post(
  "/sendFriend",
  AuthMiddleware,
  checkFriendshipStatus,
  sendFriendRequestController,
);
router.post(
  "/acceptFriend",
  AuthMiddleware,
  checkAcceptRequest,
  AcceptFriendRequestController,
);
router.post(
  "/cancelFriend",
  AuthMiddleware,
  checkCancelRequest,
  cancelRequestController,
);
router.post("/blockFriend", AuthMiddleware, checkBlock, blockUserController);
router.post("/unblockFriend", AuthMiddleware, checkUnblock, UnblockController);

module.exports = router;
