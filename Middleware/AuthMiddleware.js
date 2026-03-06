const jwt = require("jsonwebtoken");
const userService = require("../feauters/auth/Services/UserService.js");

async function AuthMiddleware(req, res, next) {
  try {
    const token = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!token) {
      if (refreshToken) {
        return res
          .status(498)
          .json({ message: "Token no encontrado, se puede renovar" });
      }
      return res.status(401).json({ message: "Usuario no logueado" });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.SECRET, {
        algorithms: ["HS256"],
      });
    } catch (error) {
      if (refreshToken) {
        return res
          .status(498)
          .json({ message: "Token expirado, se puede renovar" });
      }
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const usuario = await userService.findUserByUsername(decoded.username);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (usuario.is_banned || usuario.status === "blocked") {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.status(403).json({ message: "Cuenta suspendida o bloqueada" });
    }

    req.email_verified = usuario.email_verified;
    req.user = usuario.username;
    req.id = usuario.id;

    next();
  } catch (error) {
    console.error("Error crítico en AuthMiddleware:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

module.exports = AuthMiddleware;
