const express = require("express");
const loginRoute = require("./LoginRouter");
const registerRoute = require("./RegistrerRouter");
const refreshRoute = require("./RefreshLogin");
const logoutRoute = require("./LogoutRouter");
const verifyEmailRoute = require("./VerifyRouter");
const router = express.Router();

router.use("/login", loginRoute);
router.use("/register", registerRoute);
router.use("/refresh", refreshRoute);
router.use("/logout", logoutRoute);
router.use("/verify-email", verifyEmailRoute);
module.exports = router;
