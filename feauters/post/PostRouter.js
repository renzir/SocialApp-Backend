const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../../Middleware/AuthMiddleware.js");
const createPostController = require("./controller/CreatePostController.js");
const ModifyPostController = require("./controller/ModifyPostController.js");
const GetPostByIdController = require("./controller/GetPostByIdController.js");
const GetAllPostsController = require("./controller/GetAllPostsController.js");
const DeletePostController = require("./controller/DeletePostController.js");
const checkPostOwnership = require("./middleware/checkPostOwnership.js");

router.post("/create", AuthMiddleware, createPostController);
router.get("/getbyid/:id", AuthMiddleware, GetPostByIdController);
router.get("/getAll", AuthMiddleware, GetAllPostsController);
router.put(
  "/modify/:id",
  AuthMiddleware,
  checkPostOwnership,
  ModifyPostController,
);
router.delete(
  "/delete/:id",
  AuthMiddleware,
  checkPostOwnership,
  DeletePostController,
);

module.exports = router;
