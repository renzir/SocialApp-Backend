const getListFriendsService = require("../Services/GetListFriendsService");
const getListFriendsController = async (req, res) => {
  try {
    const { id } = req;

    const listaamigos = await getListFriendsService(id);

    res.status(200).json({ amigos: listaamigos });
  } catch (error) {
    console.error("Error en GetListFriendsController:", error);
    return res
      .status(500)
      .json({ message: "Error interno al obtener la lista de amigos" });
  }
};
module.exports = getListFriendsController;
