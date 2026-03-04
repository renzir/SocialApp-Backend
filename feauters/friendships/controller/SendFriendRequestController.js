const sendFriendRequestService = require("../Services/SendFriendRequestService.js");
const getStateByIDService = require("../services/getStateByIDService.js");

const SendFriendRequestController = async (req, res) => {
  try {
    const { friendId } = req.body;
    const { id } = req; 

    const result = await sendFriendRequestService(id, friendId);

    if (result && result.affectedRows === 0) {
      return res
        .status(500)
        .json({ message: "Error al registrar la solicitud" });
    }

    res.status(200).json({ message: "Solicitud de amistad enviada", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = SendFriendRequestController;
