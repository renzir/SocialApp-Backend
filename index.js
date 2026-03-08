require("dotenv").config();
require("./instrument.js");

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Sentry = require("@sentry/node");
const logger = require("./config/logger.js");

const AuthRouter = require("./feauters/auth/AuthRouter.js");
const UserRouter = require("./feauters/user/UserRouter.js");
const FriendshipsRouter = require("./feauters/friendships/FriendshipsRouter.js");
const PostRouter = require("./feauters/post/PostRouter.js");
const CommentRouter = require("./feauters/comment/CommentRouter.js");

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
app.use("/post", PostRouter);
app.use("/comment", CommentRouter);

Sentry.setupExpressErrorHandler(app);

app.use((err, req, res, next) => {
  logger.error(`Error en ${req.path}:`, err);

  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Servidor conectado en el puerto ${PORT}`);
});
