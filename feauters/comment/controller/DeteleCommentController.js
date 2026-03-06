const deleteCommentService = require("../services/DeteleCommentService.js");

const deleteCommentController = async (req, res) => {
    try {
        const commentId = req.params.id;
        await deleteCommentService(commentId);
        res.status(200).json({ message: "Comentario eliminado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar comentario" });
    }
};
module.exports = deleteCommentController;