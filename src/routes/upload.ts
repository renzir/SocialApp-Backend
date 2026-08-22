import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import {
  AuthenticatedRequest,
  requireAuth,
} from "../middleware/authMiddleware";

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WEBP).",
        ),
      );
    }
  },
});

export const uploadRouter = Router();

uploadRouter.post(
  "/",
  requireAuth,
  (req, res, next) => {
    // Permite campos 'images' o 'files'
    upload.array("images", 5)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({ error: "El archivo excede el límite máximo de 5MB" });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  (req: AuthenticatedRequest, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionó ningún archivo" });
    }

    const urls = files.map((file) => `/uploads/${file.filename}`);
    return res.status(200).json({ urls });
  },
);
