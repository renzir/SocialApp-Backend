
const AcceptFriendRequestService = require("../Services/AcceptFriendRequestService.js");

const UnblockController = async (req, res) => {
  
    const { friendId } = req.body;
    const { id } = req;
    const result = await AcceptFriendRequestService(id, friendId);

    if (result.affectedRows === 0) {
        return res
            .status(404)    
            .json({ message: "Error al desbloquear la solicitud de amistad" });
    }
    res.status(200).json({ message: "Amistad desbloqueada", result });

};
module.exports = UnblockController;