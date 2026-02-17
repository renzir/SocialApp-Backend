const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();


const cookieSecure = process.env.COOKIE_SECURE === "true";
const cookieSameSite = process.env.COOKIE_SAMESITE || "lax";

router.get("/", (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token)
      return res.status(401).json({ message: "No hay token de refresco" });

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    const accessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      process.env.SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "Token renovado correctamente" });
  } catch (error) {
    console.error("Error en refresh token:", error);
    return res
      .status(403)
      .json({ message: "Token de refresco inválido o expirado" });
  }
});

module.exports = router;
