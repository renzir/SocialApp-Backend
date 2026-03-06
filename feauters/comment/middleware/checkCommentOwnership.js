const getCommentByIdService = require("../services/GetCommentByIdService.js");

const checkCommentOwnership = async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const userId = req.id;

    if (!commentId) return res.status(400).json({ message: "ID requerido" });

    const comment = await getCommentByIdService(commentId);

    if (!comment) return res.status(404).json({ message: "Comentario no encontrado" });

    if (comment.user_id !== userId) {
      return res.status(403).json({ message: "No podés borrar este comentario" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno" });
  }
};

module.exports = checkCommentOwnership;