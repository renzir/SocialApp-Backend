const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const processImage = async (filePath) => {
  try {
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath, ext);
    const optimizedPath = `uploads/${fileName}-optimized.webp`;

    await sharp(filePath)
      .resize({
        width: 1200,
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(optimizedPath);

    fs.unlinkSync(filePath);

    return optimizedPath;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}; 

module.exports = { processImage };
