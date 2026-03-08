const bcrypt = require("bcrypt");
const generateEmailVerifyToken = require("../utils/emailToken.js");
const sendVerificationEmail = require("../Services/EmailService.js");
const UserService = require("../Services/UserService.js");

const saltRounds = 10;

const RegisterController = async (req, res) => {
  const { username, password, email } = req.body;
  
    const passHash = await bcrypt.hash(password, saltRounds);

    const result = await UserService.createUser(username, passHash, email);

    const userid = result.insertId;

    const token = generateEmailVerifyToken(userid);
    await sendVerificationEmail(email, token);

    return res.status(200).json({ message: "Usuario registrado. " });
  
};
module.exports = RegisterController;
