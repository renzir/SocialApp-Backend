const updateProfileImageService = require("../Services/updateProfileImageService.js");
const imageProcessingService = require("../../post/Services/imageProcessingService.js"); // Importamos el servicio de optimización

const updateProfileImageController = async (req, res) => {
  try {
    const { id } = req; 

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Se requiere una imagen para actualizar el perfil" });
    }

    //
    let optimizedImageUrl;
    try {
      optimizedImageUrl = await imageProcessingService.processImage(
        req.file.path,
      );
    } catch (error) {
      console.error("Error al optimizar imagen de perfil:", error);
      return res.status(500).json({ message: "Error al procesar la imagen" });
    }

    const result = await updateProfileImageService(id, optimizedImageUrl);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: "Foto de perfil actualizada exitosamente",
      profile_image_url: optimizedImageUrl,
    });
  } catch (error) {
    console.error("Error en updateProfileImageController:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = updateProfileImageController;
