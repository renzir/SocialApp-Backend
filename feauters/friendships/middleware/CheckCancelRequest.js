const getStateByIDService = require("../services/getStateByIDService.js"); // Importamos el servicio

const checkCancelRequest = async (req, res, next) => {
  try {
    const { friendId } = req.body;
    const { id } = req;

    if (!friendId) {
      return res
        .status(400)
        .json({ message: "Se requiere amigo para cancelar solicitud" });
    }

    if (Number(id) === Number(friendId)) {
      return res
        .status(400)
        .json({ message: "No puedes cancelar solicitud a ti mismo" });
    }

  
    const relationship = await getStateByIDService(id, friendId);


    if (relationship && relationship.status === "blocked") {
      return res
        .status(400)
        .json({
          message:
            "No puedes cancelar la solicitud porque el usuario está bloqueado",
        });
    }

    next(); 
  } catch (error) {
    console.error("Error en checkCancelRequest middleware:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = checkCancelRequest;
