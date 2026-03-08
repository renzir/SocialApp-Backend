const getCommentsService = require("../services/GetCommentsService.js");

const getCommentsController = async (req, res) => {
    
        const { postId } = req.params;
        const comments = await getCommentsService(postId);
        res.status(200).json(comments);

};
module.exports = getCommentsController;