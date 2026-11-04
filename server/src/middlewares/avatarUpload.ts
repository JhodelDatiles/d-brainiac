import type { RequestHandler } from "express";
import multer from "multer";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const TYPE_ERROR = "Only JPEG, PNG or WebP images are allowed";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new Error(TYPE_ERROR));
  },
}).single("avatar");

export const avatarUpload: RequestHandler = (req, res, next) => {
  upload(req, res, (err: unknown) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image must be 2 MB or smaller"
          : "Invalid upload";
      res.status(400).json({ message });
      return;
    }
    if (err instanceof Error && err.message === TYPE_ERROR) {
      res.status(400).json({ message: TYPE_ERROR });
      return;
    }
    next(err);
  });
};
