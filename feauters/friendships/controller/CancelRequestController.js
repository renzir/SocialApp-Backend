const cancelFriendRequestService = require("../services/CancelRequestService.js");

const CancelRequestController = async (req, res) => {
  try {
    const { friendId } = req.body;
    const { id } = req;

    const result = await cancelFriendRequestService(id, friendId);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          message:
            "No existe ninguna solicitud o amistad para cancelar entre estos usuarios",
        });
    }
    res
      .status(200)
      .json({ message: "Solicitud cancelada", result });
  } catch (error) {
    console.error("Error en Cancel request:", error);
    res.status(500).json({ message: "Error interno al cancelar la solicitud" });
  }
};
module.exports = CancelRequestController;
