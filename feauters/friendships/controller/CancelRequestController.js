const cancelFriendRequestService = require("../services/CancelRequestService.js");

const CancelRequestController = async (req, res) => {
 
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

};
module.exports = CancelRequestController;
