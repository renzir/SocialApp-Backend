const createPostService = require("../Services/CreatePostService.js");

const createPostController = async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req;
    if (!content) {
      return res
        .status(400)
        .json({ message: "El contenido del post es requerido" });
    }

    const result = await createPostService(id, content);
    if (result && result.affectedRows === 0) {
      return res.status(500).json({ message: "Error al crear el post" });
    }
    res
      .status(201)
      .json({ message: "Post creado exitosamente", postId: result.insertId });
  } catch (error) {
    console.error("Error en createPostController:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
module.exports = createPostController;
