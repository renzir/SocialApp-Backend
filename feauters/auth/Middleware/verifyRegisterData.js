const UserService = require("../Services/UserService.js");
const logger = require("../../../config/logger.js");

const verifyRegisterData = async (req, res, next) => {

    const { username, email } = req.body;

    const usuarioExistente = await UserService.findUserByUsername(username);
    if (usuarioExistente) {
      logger.warn("Registro fallido: Usuario ya existe", { username }); 
      return res.status(409).json({ message: "Usuario ya registrado" });
    }

    const emailExistente = await UserService.findUserByEmail(email);

    if (emailExistente) {
      logger.warn("Registro fallido: Email ya existe", { email }); 
      return res.status(409).json({ message: "Email ya registrado" });
    }
    next();
  
}
module.exports = verifyRegisterData;
