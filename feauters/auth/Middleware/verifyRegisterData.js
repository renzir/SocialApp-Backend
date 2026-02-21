const UserService = require("../Services/UserService.js");
async function verifyRegisterData(req, res, next) {
  const { username, email } = req.body;
  try {
    const usuarioExistente = await UserService.findUserByUsername(username);
    if (usuarioExistente) {
      return res.status(409).json({ message: "Usuario ya registrado" });
    }

    const emailExistente = await UserService.findUserByEmail(email);

    if (emailExistente) {
      return res.status(409).json({ message: "Email ya registrado" });
    }
    next();
  } catch (error) {
    console.error("Error en verifyRegisterData:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}
module.exports = verifyRegisterData;
