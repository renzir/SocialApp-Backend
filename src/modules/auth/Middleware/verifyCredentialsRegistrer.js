const logger = require("../../../config/logger.js");

function verifyCredentials(req, res, next) {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    logger.warn("Registro fallido: Faltan campos", { username, email });
    return res
      .status(400)
      .json({ message: "Por favor, complete todos los campos." });
  }

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof email !== "string"
  ) {
    logger.warn("Registro fallido: Formato de datos inválido", {
      username,
      email,
    });
    return res.status(400).json({ message: "Formato de datos inválido." });
  }

  req.body.username = username.trim();
  req.body.password = password.trim();
  req.body.email = email.trim();

  if (req.body.username.length < 3 || req.body.username.length > 50) {
    logger.warn("Registro fallido: Nombre de usuario inválido", { username });
    return res.status(400).json({
      message: "El nombre de usuario debe tener entre 3 y 50 caracteres.",
    });
  }

  if (password.length < 6) {
    logger.warn("Registro fallido: Contraseña demasiado corta", { username });
    return res
      .status(400)
      .json({ message: "La contraseña debe tener al menos 6 caracteres." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    logger.warn("Registro fallido: Email inválido", { email });
    return res.status(400).json({ message: "El email no es válido" });
  }

  next();
}
module.exports = verifyCredentials;
