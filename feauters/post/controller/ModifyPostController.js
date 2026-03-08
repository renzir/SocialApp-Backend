const modifyPostService = require("../Services/ModifyPostService.js");
const imageProcessingService = require("../Services/imageProcessingService.js"); 

const ModifyPostController = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;

    if (!content) {
      return res
        .status(400)
        .json({ message: "El contenido del post es requerido" });
    }

    let newImagesUrls = [];
    if (req.files && req.files.length > 0) {
      newImagesUrls = await Promise.all(
        req.files.map(async (file) => {
          try {
            const optimizedPath = await imageProcessingService.processImage(
              file.path,
            );
            return optimizedPath;
          } catch (error) {
            console.error("Error al procesar la imagen:", error);

            return res
              .status(500)
              .json({ message: "Error al optimizar la imagen" });
          }
        }),
      );
    }

    const result = await modifyPostService(postId, content, newImagesUrls);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró el post para modificar" });
    }

    res.status(200).json({
      message: "Post modificado exitosamente",
      imagesUpdated: newImagesUrls.length > 0,
    });
  } catch (error) {
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message:
          "Error al subir las imágenes (límite excedido o campo incorrecto)",
      });
    }

    throw error;
  }
};

module.exports = ModifyPostController;
