const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../../Middleware/AuthMiddleware.js");
const createCommentController = require("./controller/CreateCommentController.js");
const getCommentsController = require("./controller/GetCommentsController.js");
const deleteCommentController = require("./controller/DeteleCommentController.js");
const checkCommentOwnership = require("./middleware/checkCommentOwnership.js");

router.post("/create", AuthMiddleware, createCommentController);
router.get("/post/:postId", AuthMiddleware, getCommentsController); 
router.delete("/delete/:id", AuthMiddleware, checkCommentOwnership, deleteCommentController);

module.exports = router;