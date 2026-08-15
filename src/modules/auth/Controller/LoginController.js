const jwt = require("jsonwebtoken");
const cookieSecure = process.env.COOKIE_SECURE === "true";
const cookieSameSite = process.env.COOKIE_SAMESITE || "lax";

const LoginController = async (req, res) => {
  const usuario = req.user;

 
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
};

const LogoutController = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Usuario deslogueado" });
};

module.exports = { LoginController, LogoutController };
