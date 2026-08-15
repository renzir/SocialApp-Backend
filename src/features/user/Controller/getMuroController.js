const getMuroService = require("../Services/getMuroService");

const getMuroController = async (req, res) => {
  
    const { id } = req;

    const muro = await getMuroService(id);

    res.status(200).json(muro);

};
module.exports = getMuroController;
