const jwt = require("jsonwebtoken");
const cookieSecure = process.env.COOKIE_SECURE === "true";
const cookieSameSite = process.env.COOKIE_SAMESITE || "lax";
const userService = require("../Services/UserService.js");

const refreshTokenController = async (req, res) => {
  try {
    console.log("Intentando refrescar token...");
    const token = req.cookies.refreshToken;

    if (!token) {
      console.warn("No se encontró refresh token");
      return res.status(401).json({ message: "No hay token de refresco" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    } catch (jwtError) {
      console.warn("Refresh token inválido:", jwtError.message);
      return res
        .status(403)
        .json({ message: "Token de refresco inválido o expirado" });
    }

    const usuario = await userService.findUserByUsername(decoded.username);

    if (!usuario) {
      console.warn("Usuario no encontrado al refrescar token:", decoded.id);
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
  } catch (error) {
    console.error("Error en refresh token:", error);
    return res
      .status(500)
      .json({ message: "Error interno al renovar el token" });
  }
};

module.exports = refreshTokenController;
