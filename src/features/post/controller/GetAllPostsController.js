const getAllPostsService = require("../Services/getAllPostsService.js");

const GetAllPostsController = async (req, res) => {
  const posts = await getAllPostsService();
  res.status(200).json({ message: "Posts obtenidos correctamente", posts });
};

module.exports = GetAllPostsController;
