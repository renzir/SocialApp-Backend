const getStateByIDService = require("../services/getStateByIDService.js");

const checkFriendshipStatus = async (req, res, next) => {
  const { friendId } = req.body;
  const { id } = req;

  if (Number(id) === Number(friendId)) {
    return res
      .status(400)
      .json({ message: "No puedes enviar una solicitud de ti mismo" });
  }
  const getState = await getStateByIDService(id, friendId);

  if (getState) {
    if (getState.status === "pending") {
      if (getState.sender_id === id) {
        return res
          .status(400)
          .json({ message: "Ya enviaste una solicitud a este usuario" });
      } else {
        return res
          .status(400)
          .json({ message: "Este usuario ya te envió solicitud, acéptala" });
      }
    }

    if (getState.status === "confirmed" || getState.status === "accepted") {
      return res.status(400).json({ message: "Ya son amigos" });
    }

    if (getState.status === "blocked") {
      if (getState.sender_id === id) {
        return res.status(400).json({
          message: "Bloqueaste a este usuario. Desbloquéalo para agregarlo.",
        });
      } else {
        return res
          .status(403)
          .json({ message: "No puedes enviar solicitud a este usuario." });
      }
    }
  }

  next();
};

module.exports = checkFriendshipStatus;
