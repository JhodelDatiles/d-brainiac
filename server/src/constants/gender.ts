export const GENDERS = [
  "male",
  "female",
  "non-binary",
  "prefer-not-to-say",
] as const;

export type Gender = (typeof GENDERS)[number];
