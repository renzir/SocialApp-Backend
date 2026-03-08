const express = require("express");
const router = express.Router();

const {
  LoginController,
  LogoutController,
} = require("../auth/Controller/LoginController.js");
const RegisterController = require("../auth/Controller/RegisterController.js");
const RefreshController = require("../auth/Controller/RefreshController.js");
const VerifyEmailController = require("../auth/Controller/VerifyController.js");
const verifyCredentials = require("../auth/Middleware/verifyCredentials.js");
const verifyCredentialsRegister = require("../auth/Middleware/verifyCredentialsRegistrer.js");
const verifyLoginData = require("../auth/Middleware/verifyLoginData.js");
const verifyRegisterData = require("../auth/Middleware/verifyRegisterData.js");

router.post("/login", verifyCredentials, verifyLoginData, LoginController);
router.post(
  "/register",
  verifyCredentialsRegister,
  verifyRegisterData,
  RegisterController,
);
router.get("/refresh", RefreshController);
router.get("/logout", LogoutController);
router.get("/verify-email", VerifyEmailController);

module.exports = router;
