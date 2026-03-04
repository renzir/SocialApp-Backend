const AcceptFriendRequestService = require("../Services/AcceptFriendRequestService.js");
const getStateByIDService = require("../services/getStateByIDService.js");

const AcceptFriendRequestController = async (req, res) => {
  try {
    const { friendId } = req.body;
    const { id } = req; 

    const result = await AcceptFriendRequestService(id, friendId);

    if (result.affectedRows === 0) {
      return res
        .status(500)
        .json({
          message: "Error interno: No se pudo actualizar el estado a 'amigos'",
        });
    }

    res
      .status(200)
      .json({
        message:
          "Solicitud de amistad aceptada correctamente. ¡Ahora son amigos!",
        result,
      });
  } catch (error) {
    console.error("Error en AcceptFriendRequestController:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = AcceptFriendRequestController;
