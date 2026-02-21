const express = require("express");
const router = express.Router();

// Controladores
const {
  LoginController,
  LogoutController,
} = require("../auth/Controller/LoginController.js");
const RegisterController = require("../auth/Controller/RegisterController.js");
const RefreshController = require("../auth/Controller/RefreshController.js");
const VerifyEmailController = require("../auth/Controller/VerifyController.js");

// Middlewares
const verifyCredentials = require("../auth/Middleware/verifyCredentials.js");
const verifyLoginData = require("../auth/Middleware/verifyLoginData.js");
const verifyRegisterData = require("../auth/Middleware/verifyRegisterData.js");

// Rutas
router.post("/login", verifyCredentials, verifyLoginData, LoginController);
router.post(
  "/register",
  verifyCredentials,
  verifyRegisterData,
  RegisterController,
);
router.get("/refresh", RefreshController);
router.get("/logout", LogoutController);
router.get("/verify-email", VerifyEmailController);

module.exports = router;
