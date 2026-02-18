const express = require("express");
const router = express.Router();

// Controladores
const LoginController =
  require("../Controller/LoginController.js").LoginController;
const LogoutController =
  require("../Controller/LoginController.js").LogoutController;
const RegisterController = require("../Controller/RegisterController.js");
const RefreshController = require("../Controller/RefreshController.js");
const VerifyEmailController = require("../Controller/VerifyController.js");

// Middlewares
const verifyCredentials = require("../Middleware/verifyCredentials.js");
const verifyLoginData = require("../Middleware/verifyLoginData.js");
const verifyRegisterData = require("../Middleware/verifyRegisterData.js");

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
