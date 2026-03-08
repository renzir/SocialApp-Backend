const getProfileService = require("../Services/GetProfileService");

const getProfileController = async (req, res) => {
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
};

module.exports = getProfileController;
