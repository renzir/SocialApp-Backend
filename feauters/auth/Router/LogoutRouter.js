const express = require("express");
const router = express.Router(); 

router.get("/", async (req, res) => {

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Sesión cerrada" });
});

module.exports = router;
