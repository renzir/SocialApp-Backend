const getAllPostsService = require("../Services/getAllPostsService.js");

const GetAllPostsController = async (req, res) => {
  try {
    const posts = await getAllPostsService();
    res.status(200).json({ message: "Posts obtenidos correctamente", posts });
  } catch (error) {
    console.error("Error en GetAllPostsController:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = GetAllPostsController;