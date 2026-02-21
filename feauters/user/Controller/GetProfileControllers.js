const getProfileService = require("../Services/GetProfileService");

const getProfileController = async (req, res) => {
  try {
    const { id } = req; 

    const userProfile = await getProfileService(id);

    if (!userProfile) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      usuario: {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email, 
        profile_image_url: userProfile.profile_image_url, 
        email_verified: userProfile.email_verified,
      },
    });

  } catch (error) {
    console.error("Error en getProfileController:", error);
    return res.status(500).json({ message: "Error interno al obtener perfil" });
  }
};

module.exports = getProfileController;