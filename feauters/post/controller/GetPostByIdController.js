const getPostByIdService = require("../Services/GetPostByIdService.js");

const GetPostByIdController = async (req, res) => {
  try {
    const postId = req.params.id; 
    if (!postId) {
      return res.status(400).json({ message: "El ID del post es requerido" });
    }

    const post = await getPostByIdService(postId);

    if (!post) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    res.status(200).json({ message: "Post obtenido correctamente", post });
  } catch (error) {
    console.error("Error en GetPostByIdController:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = GetPostByIdController;