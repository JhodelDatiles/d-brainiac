import type { Gender } from "../constants/gender.ts";

interface UserLike {
  id: string;
  email: string;
  name?: string | null | undefined;
  bio?: string | null | undefined;
  gender?: Gender | null | undefined;
  avatarUrl?: string | null | undefined;
}

export const toPublicUser = (user: UserLike) => ({
  id: user.id,
  email: user.email,
  name: user.name || (user.email.split("@")[0] ?? user.email),
  bio: user.bio ?? "",
  gender: user.gender ?? "prefer-not-to-say",
  avatarUrl: user.avatarUrl ?? null,
});
