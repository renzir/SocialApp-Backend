const { get } = require("../../../config/mailer.js");
const  blockUserService  = require("../services/blockUserService.js");
const getStateByIDService = require("../services/getStateByIDService.js");

const blockUserController  = async (req, res) => {
  try {
    const { friendId } = req.body;
    const { id } = req;

    const getState = await getStateByIDService(id, friendId);

    if (getState.status === "blocked") {
      return res.status(400).json({ message: "Ya está bloqueada" });
    }

    const result = await blockUserService(id, friendId);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Error al bloquear la solicitud de amistad" });
    }
    res.status(200).json({ message: "Amistad bloqueada", result });
  } catch (error) {
    console.error("Error en blockUserController:", error);
    res
      .status(500)
      .json({ message: "Error al bloquear la solicitud de amistad" });
  }
};
module.exports = blockUserController;
