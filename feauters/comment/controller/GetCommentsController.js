const getCommentsService = require("../services/GetCommentsService.js");

const getCommentsController = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await getCommentsService(postId);
        res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener comentarios" });
    }
};
module.exports = getCommentsController;