const sendFriendRequestService = require("../Services/SendFriendRequestService.js");

const SendFriendRequestController = async (req, res) => {
  try {
    const { friendId } = req.body;
    const { id } = req; 

    const result = await sendFriendRequestService(id, friendId);

    res.status(200).json({ message: "Solicitud de amistad enviada", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = SendFriendRequestController;