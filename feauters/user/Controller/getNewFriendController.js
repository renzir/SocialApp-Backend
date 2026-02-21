const getNewFriendService = require("../Services/getNewFriendService");

const getNewFriendController = async (req, res) => {
  try {
    const { id } = req;

    const newFriend = await getNewFriendService(id);

    res.status(200).json(newFriend);
  } catch (error) {
    console.error("Error en getNewFriendController:", error);
    return res.status(500).json({ message: "Error interno al obtener nuevo amigo" });
  }
};

module.exports = getNewFriendController;