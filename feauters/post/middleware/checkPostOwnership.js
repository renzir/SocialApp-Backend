const getPostByIdService = require("../Services/GetPostByIdService.js");

const checkPostOwnership = async (req, res, next) => {
  
    const postId = req.params.id; 
    const { id: userId } = req;
       
    if (!postId) {
      return res.status(400).json({ message: "El ID del post es requerido" });
    }

    const post = await getPostByIdService(postId);

    if (!post) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ message: "No tienes permiso para modificar o eliminar este post" });
    }

    next(); 

};

module.exports = checkPostOwnership;