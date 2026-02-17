const express = require("express");
const bcrypt = require("bcrypt");
const UserService = require("../Services/UserService.js");
const verificarDatos = require("../Middleware/verifyCredentials.js");
const verifyRegisterData = require("../Middleware/verifyRegisterData.js");
const generateEmailVerifyToken = require("../utils/emailToken.js");
const sendVerificationEmail = require("../../../services/sendVerificationEmail.js");

const router = express.Router();
const saltRounds = 10;

router.post("/", verificarDatos, verifyRegisterData, async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const passHash = await bcrypt.hash(password, saltRounds);

    const result = await UserService.createUser(username, passHash, email);

    const userid = result.insertId;

    const token = generateEmailVerifyToken(userid);
    await sendVerificationEmail(email, token);

    return res.status(200).json({ message: "Usuario registrado. " });
  } catch (error) {
    console.error("Error en router de registro:", error);
    return res
      .status(500)
      .json({ message: "Error interno al registrar usuario" });
  }
});

module.exports = router;
