const express = require("express");
const jwt = require("jsonwebtoken");
const verificarDatos = require("../Middleware/verifyCredentials.js");
const verifyLoginData = require("../Middleware/verifyLoginData.js");

const router = express.Router();

const cookieSecure = process.env.COOKIE_SECURE === "true";
const cookieSameSite = process.env.COOKIE_SAMESITE || "lax";

router.post("/", verificarDatos, verifyLoginData, async (req, res) => {
  const usuario = req.usuario;
  try {
    const accessToken = jwt.sign(
      { id: usuario.id, username: usuario.username },
      process.env.SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { id: usuario.id, username: usuario.username },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Usuario logeado" });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
