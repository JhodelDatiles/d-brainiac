import { v2 as cloudinary } from "cloudinary";
import { config } from "../envConfig.ts";

const FOLDER = "brainiac/avatars";

if (config.cloudinary) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

const assertConfigured = (): void => {
  if (!config.cloudinary) throw new Error("Cloudinary is not configured");
};

// One fixed public_id per user: re-uploading overwrites, so nothing is orphaned
export const uploadAvatarImage = (
  userId: string,
  buffer: Buffer,
): Promise<string> => {
  assertConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        public_id: userId,
        overwrite: true,
        invalidate: true,
        resource_type: "image",
        transformation: [
          { width: 256, height: 256, crop: "fill", gravity: "face" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Avatar upload failed"));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
};

export const deleteAvatarImage = async (userId: string): Promise<void> => {
  assertConfigured();
  await cloudinary.uploader.destroy(`${FOLDER}/${userId}`, {
    invalidate: true,
  });
};
