const getStateByIDService = require("../services/getStateByIDService.js");

const checkAcceptRequest = async (req, res, next) => {
  
    const { friendId } = req.body;
    const { id } = req;

    if (!friendId) {
      return res
        .status(400)
        .json({ message: "Se requiere amistad para aceptar la solicitud" });
    }

    if (Number(id) === Number(friendId)) {
      return res
        .status(400)
        .json({ message: "No puedes aceptar una solicitud de ti mismo" });
    }
    const relationship = await getStateByIDService(id, friendId);

    if (!relationship) {
      return res.status(404).json({
        message: "No existe ninguna solicitud de amistad entre estos usuarios",
      });
    }

    if (relationship.status === "confirmed") {
      return res
        .status(400)
        .json({ message: "Ya son amigos, no es necesario aceptar de nuevo" });
    }

    if (relationship.status === "blocked") {
      return res.status(400).json({
        message:
          "No se puede aceptar la solicitud porque hay un bloqueo activo",
      });
    }

    if (relationship.status === "pending") {
      if (relationship.sender_id === id) {
        return res.status(400).json({
          message:
            "No puedes aceptar una solicitud que tú mismo enviaste. Debes esperar a que el otro usuario la acepte.",
        });
      }
    } else {
      return res.status(400).json({
        message:
          "La solicitud de amistad fue cancelada o rechazada previamente",
      });
    }

    next();

};

module.exports = checkAcceptRequest;
