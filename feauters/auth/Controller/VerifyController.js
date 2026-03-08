const jwt = require("jsonwebtoken");
const UserService = require("../Services/UserService.js");

const VerifyController = async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFY_SECRET, {
      algorithms: ['HS256'], 
    });

    const result = await UserService.verifyEmail(decoded.userid);

    if (result.affectedRows === 1) {
      res.status(200).send(`
        <html>
          <body>
            <h2>Verificación exitosa</h2>
            <p>Ya puedes cerrar esta pestaña.</p>
          </body>
        </html>
      `);
    } 
      return res.status(400).json({
        message: "No se pudo verificar el email o usuario no encontrado",
      });
    
  } catch (error) {

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Token inválido" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "El token ha expirado" });
    }
    throw error;
  }
};
module.exports = VerifyController;