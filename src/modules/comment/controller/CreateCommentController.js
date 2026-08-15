const createCommentService = require("../services/CreateCommentService.js");

const createCommentController = async (req, res) => {
  const { postId, content } = req.body;
  const { id } = req;

  if (!postId || !content) {
    return res.status(400).json({ message: "Faltan datos (postId o content)" });
  }

  const result = await createCommentService(id, postId, content);
  res
    .status(201)
    .json({ message: "Comentario creado", commentId: result.insertId });
};
module.exports = createCommentController;
