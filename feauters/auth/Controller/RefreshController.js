const jwt = require("jsonwebtoken");
const userService = require("../Services/UserService.js");

const cookieSecure = process.env.COOKIE_SECURE === "true";
const cookieSameSite = process.env.COOKIE_SAMESITE || "lax";

const refreshTokenController = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Tiene que iniciar sesión" });
  }

  const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

  const usuario = await userService.findUserByUsername(decoded.username);

  if (!usuario) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  const accessToken = jwt.sign(
    { id: decoded.id, username: usuario.username },
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
};

module.exports = refreshTokenController;
