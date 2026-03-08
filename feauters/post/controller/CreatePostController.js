const createPostService = require("../Services/CreatePostService.js");
const imageProcessingService = require("../Services/imageProcessingService.js");

const createPostController = async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req;

    console.log("Body:", req.body);
    console.log("Files:", req.files);

    if (!content) {
      return res
        .status(400)
        .json({ message: "El contenido del post es requerido" });
    }

    let imagesUrls = [];

    if (req.files && req.files.length > 0) {
      console.log("Procesando imágenes...");
      imagesUrls = await Promise.all(
        req.files.map((file) => imageProcessingService.processImage(file.path)),
      );

      console.log("Imágenes optimizadas:", imagesUrls);
    } else {
      console.log("No llegaron archivos o el campo no se llama 'images'");
    }

    const result = await createPostService(id, content, imagesUrls);

    if (!result || !result.insertId) {
      return res
        .status(500)
        .json({ message: "Error al crear el post en base de datos" });
    }

    res.status(201).json({
      message: "Post creado exitosamente",
      postId: result.insertId,
      images: imagesUrls,
    });
  } catch (error) {
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "Error al subir las imágenes" });
    }
    throw error;
  }
};

module.exports = createPostController;
