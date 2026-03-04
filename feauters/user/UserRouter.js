const express = require("express");
const router = express.Router();
const getProfileController = require("./Controller/GetProfileControllers.js");
const AuthMiddleware = require("../../Middleware/AuthMiddleware.js");
const getMuroController = require("./Controller/GetMuroController.js");
const getListFriendsController = require("./Controller/getListFriendsController.js");

router.get("/", AuthMiddleware, getProfileController);
router.get("/muro", AuthMiddleware, getMuroController);
router.get("/friends", AuthMiddleware, getListFriendsController)

module.exports = router;
