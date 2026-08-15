const bcrypt = require("bcrypt");
const userService = require("../Services/UserService.js");
const logger = require("../../../config/logger.js");

const verifyLoginData = async (req, res, next) => {
  const { username, password } = req.body;

  const user = await userService.findUserForLogin(username);

  if (!user) {
    logger.warn("Intento de login fallido (usuario no encontrado):", username);
    return res
      .status(401)
      .json({ message: "Usuario o contraseña incorrectos" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    logger.warn("Intento de login fallido (contraseña incorrecta):", username);
    return res
      .status(401)
      .json({ message: "Usuario o contraseña incorrectos" });
  }


  req.user = user;
  next();
};

module.exports = verifyLoginData;
