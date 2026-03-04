const deletePostService = require("../Services/DeletePostService.js");

const DeletePostController = async (req, res) => {
  try {
    const postId = req.params.id; 
    if (!postId) {
      return res.status(400).json({ message: "El ID del post es requerido" });
    }

    const result = await deletePostService(postId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Post no encontrado para eliminar" });
    }

    res.status(200).json({ message: "Post eliminado exitosamente" });
  } catch (error) {
    console.error("Error en DeletePostController:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = DeletePostController;