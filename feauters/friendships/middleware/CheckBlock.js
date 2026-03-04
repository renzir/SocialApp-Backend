const getStateByIDService = require("../services/getStateByIDService.js");

const checkBlock = async (req, res, next) => {
  try {
    const { friendId } = req.body;
    const { id } = req;

    const relationship = await getStateByIDService(id, friendId);

    if (!relationship) {
      return res
        .status(404)
        .json({ message: "No existe ninguna relación entre estos usuarios" });
    }

    if (
      relationship.status === "blocked" 
    ) {
      return res
        .status(400)
        .json({ message: "La relación ya está bloqueada o cancelada" });
    }

    next();
  } catch (error) {
    console.error("Error en checkBlock middleware:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = checkBlock;
