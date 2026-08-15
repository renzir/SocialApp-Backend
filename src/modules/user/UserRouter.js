const express = require("express");
const router = express.Router();
const getProfileController = require("./Controller/GetProfileControllers.js");
const AuthMiddleware = require("../../Middleware/AuthMiddleware.js");
const getMuroController = require("./Controller/getMuroController.js");
const getListFriendsController = require("./Controller/getListFriendsController.js");
const updateProfileImageController = require("./Controller/updateProfileImageController.js");
const upload = require("../post/middleware/uploadImage.js");

router.get("/", AuthMiddleware, getProfileController);
router.get("/muro", AuthMiddleware, getMuroController);
router.get("/friends", AuthMiddleware, getListFriendsController)
router.put("/profile-image", AuthMiddleware, upload.single("profile_image"), updateProfileImageController);

module.exports = router;

