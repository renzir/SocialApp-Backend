const bcrypt = require("bcrypt");
const UserService = require("../Services/UserService.js"); // Usar el servicio

async function verifyLoginData(req, res, next) {
  const { username, password } = req.body;

  try {
    const usuario = await UserService.findUserByUsername(username);

    if (!usuario) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const testPass = await bcrypt.compare(password, usuario.password);

    if (!testPass) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    console.error("Error en verifyLoginData:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

module.exports = verifyLoginData;
