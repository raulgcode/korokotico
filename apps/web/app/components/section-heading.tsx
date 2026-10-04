import { cn } from "~/lib/utils";

type Props = {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  align?: "center" | "left";
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({ eyebrow, title, subtitle, align = "center", as: Tag = "h2", className }: Props) {
  if (!eyebrow && !title && !subtitle) return null;
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && (
        <Tag
          className={cn(
            "mt-3 font-semibold text-foreground",
            Tag === "h1" ? "text-4xl leading-[1.05] sm:text-5xl lg:text-6xl" : "text-3xl leading-tight sm:text-4xl lg:text-5xl",
          )}
        >
          {title}
        </Tag>
      )}
      {subtitle && <p className="mt-4 text-lg text-muted-foreground sm:text-xl">{subtitle}</p>}
    </div>
  );
}
