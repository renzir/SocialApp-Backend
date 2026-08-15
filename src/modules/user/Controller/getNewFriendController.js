const getNewFriendService = require("../Services/getNewFriendService");

const getNewFriendController = async (req, res) => {
  
    const { id } = req;

    const newFriend = await getNewFriendService(id);

    res.status(200).json(newFriend);

};

module.exports = getNewFriendController;