const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const AuthRouter = require("./feauters/auth/Router/AuthRouter.js");
const AuthMiddleware = require("./Middleware/AuthMiddleware.js");

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/auth", AuthRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Bienvenido a la API de SocialApp" });
});

app.get("/perfil", AuthMiddleware, async (req, res) => {
  res.status(200).json({
    usuario: {
      id: req.id,
      username: req.user,
      profile_image_url: null,
      email_verified: req.email_verified,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Servidor conectado en el puerto ${PORT}`);
});
