const getMuroService = require("../Services/getMuroService");

const getMuroController = async (req, res) => {
  try {
    const { id } = req;

    const muro = await getMuroService(id);

    res.status(200).json(muro);
  } catch (error) {
    console.error("Error en getMuroController:", error);
    return res.status(500).json({ message: "Error interno al obtener muro" });
  }
};
module.exports = getMuroController;
