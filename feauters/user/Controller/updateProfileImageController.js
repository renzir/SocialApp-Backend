const updateProfileImageService = require("../Services/updateProfileImageService.js");
const imageProcessingService = require("../../post/Services/imageProcessingService.js"); // Importamos el servicio de optimización

const updateProfileImageController = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "Se requiere una imagen para actualizar el perfil" });
  }
  const { id } = req;

  const optimizedImageUrl = await imageProcessingService.processImage(
    req.file.path,
  );

  const result = await updateProfileImageService(id, optimizedImageUrl);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  res.status(200).json({
    message: "Foto de perfil actualizada exitosamente",
    profile_image_url: optimizedImageUrl,
  });
};

module.exports = updateProfileImageController;
