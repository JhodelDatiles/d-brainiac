const sizes = { sm: "w-9 text-sm", lg: "w-24 text-4xl" } as const;

interface AvatarProps {
  name: string;
  src: string | null;
  size?: keyof typeof sizes;
}

export default function Avatar({ name, src, size = "sm" }: AvatarProps) {
  return (
    <div className={src ? "avatar" : "avatar avatar-placeholder"}>
      <div
        className={`${sizes[size]} rounded-full bg-primary text-primary-content`}
      >
        {src ? (
          <img src={src} alt={`${name}'s avatar`} />
        ) : (
          <span className="uppercase">{name.charAt(0) || "?"}</span>
        )}
      </div>
    </div>
  );
}
