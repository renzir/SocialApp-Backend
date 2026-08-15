const express = require("express");
const router = express.Router();

const { validateSchema } = require("../../src/middleware/validateSchema");
const { registerSchema, loginSchema } = require("../../src/types/zodSchemas");

const {
  LoginController,
  LogoutController,
} = require("../auth/Controller/LoginController.js");
const RegisterController = require("../auth/Controller/RegisterController.js");
const RefreshController = require("../auth/Controller/RefreshController.js");
const VerifyEmailController = require("../auth/Controller/VerifyController.js");
const verifyCredentials = require("../auth/Middleware/verifyCredentials.js");
const verifyCredentialsRegister = require("../auth/Middleware/verifyCredentialsRegistrer.js");

router.post(
  "/login",
  validateSchema(loginSchema),
  verifyCredentials,
  LoginController,
);
router.post(
  "/register",
  validateSchema(registerSchema),
  verifyCredentialsRegister,
  RegisterController,
);
router.get("/refresh", RefreshController);
router.get("/logout", LogoutController);
router.get("/verify-email", VerifyEmailController);

module.exports = router;
