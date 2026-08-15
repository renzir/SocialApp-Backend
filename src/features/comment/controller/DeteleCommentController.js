const deleteCommentService = require("../services/DeteleCommentService.js");

const deleteCommentController = async (req, res) => {

        const commentId = req.params.id;
        await deleteCommentService(commentId);
        res.status(200).json({ message: "Comentario eliminado" });

};
module.exports = deleteCommentController;