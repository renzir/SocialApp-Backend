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
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (error) {
      if (refreshToken) {
        return res
          .status(498)
          .json({ message: "Token expirado, se puede renovar" });
      }
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const usuario = await userService.findUserByUsername(decoded.username);

    if (!usuario)
      return res.status(404).json({ message: "Usuario no encontrado" });

    req.email_verified = usuario.email_verified;
    req.user = usuario.username;
    req.id = usuario.id;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

module.exports = AuthMiddleware;
