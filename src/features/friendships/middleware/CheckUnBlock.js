const getStateByIDService = require("../services/getStateByIDService.js");

const checkUnblock = async (req, res, next) => {
 
    const { friendId } = req.body;
    const { id } = req;

    const relationship = await getStateByIDService(id, friendId);

    if (!relationship) {
      return res
        .status(404)
        .json({ message: "No existe ninguna relación entre estos usuarios" });
    }

    if (relationship.status !== "blocked") {
      return res
        .status(400)
        .json({ message: "La relación no está bloqueada" });
    }

   
    // if (relationship.sender_id !== id) {
    //   return res
    //     .status(403)
    //     .json({ message: "No puedes desbloquear a este usuario porque no fuiste tú quien lo bloqueó" });
    // }

    next(); 

};

module.exports = checkUnblock;