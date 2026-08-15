const getListFriendsService = require("../Services/GetListFriendsService");
const getListFriendsController = async (req, res) => {
 
    const { id } = req;

    const listaamigos = await getListFriendsService(id);

    res.status(200).json({ amigos: listaamigos });

};
module.exports = getListFriendsController;
