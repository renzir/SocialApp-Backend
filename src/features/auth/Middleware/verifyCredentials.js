const logger = require('../../../config/logger.js'); 
function verifyCredentials(req, res, next) {
  const { username, password, email } = req.body;

  if (!username || !password) {
    logger.warn("Registro fallido: Faltan campos", { username, email });
    return res.status(400).json({ message: "Por favor, complete todos los campos." });
  }

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Formato de datos inválido." });
  }

  req.body.username = username.trim();
  req.body.password = password.trim();

  if (req.body.username.length < 3 || req.body.username.length > 50) {
    return res.status(400).json({
      message: "El nombre de usuario debe tener entre 3 y 50 caracteres.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
  }


  next();
}

module.exports = verifyCredentials;
