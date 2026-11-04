import { deleteAvatarImage } from "./cloudinary.service.ts";

interface DeletableUser {
  id: string;
  avatarUrl?: string | null | undefined;
}

// Single place for everything a user owns. The Library step adds
// `Item.deleteMany({ owner: user.id })` to this list.
export const deleteUserData = async (user: DeletableUser): Promise<void> => {
  await Promise.all([
    user.avatarUrl ? deleteAvatarImage(user.id).catch(() => {}) : undefined,
  ]);
};
