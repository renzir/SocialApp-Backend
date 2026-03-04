const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const AuthRouter = require("./feauters/auth/AuthRouter.js"); 
const UserRouter = require("./feauters/user/UserRouter.js");
const FriendshipsRouter = require("./feauters/friendships/FriendshipsRouter.js");

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

app.use("/user", UserRouter);

app.use("/rels", FriendshipsRouter);

app.listen(PORT, () => {
  console.log(`Servidor conectado en el puerto ${PORT}`);
});
