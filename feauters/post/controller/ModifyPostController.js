const modifyPostService = require("../Services/ModifyPostService.js");

const ModifyPostController = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id; 
    if (!content) {
      return res
        .status(400)
        .json({ message: "El contenido del post es requerido" });
    }


    if (!postId) {
      return res.status(400).json({ message: "El ID del post es requerido" });
    }

    const result = await modifyPostService(postId, content); // ¡Pasamos el postId al servicio!
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró el post para modificar" });
    }

    res.status(200).json({ message: "Post modificado exitosamente" });
  } catch (error) {
    console.error("Error en ModifyPostController:", error);
    res.status(500).json({ message: "Error interno al modificar el post" });
  }
};

module.exports = ModifyPostController;
