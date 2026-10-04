import { Link, NavLink } from "react-router";
import type { ComponentProps } from "react";
import { isExternal } from "~/lib/utils";

type ClassName = string | ((state: { isActive: boolean }) => string);
type Props = Omit<ComponentProps<"a">, "href" | "className"> & {
  to: string;
  newTab?: boolean | null;
  /** Usa NavLink para marcar el enlace activo */
  nav?: boolean;
  className?: ClassName;
};

/** Enlace que decide solo si es interno (React Router) o externo */
export function SmartLink({ to, newTab, nav, className, children, ...rest }: Props) {
  if (isExternal(to) || newTab) {
    const cls = typeof className === "function" ? className({ isActive: false }) : className;
    return (
      <a href={to} className={cls} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {children}
      </a>
    );
  }
  if (nav) {
    return (
      <NavLink to={to} prefetch="intent" className={className} {...rest}>
        {children}
      </NavLink>
    );
  }
  return (
    <Link to={to} prefetch="intent" className={typeof className === "function" ? className({ isActive: false }) : className} {...rest}>
      {children}
    </Link>
  );
}
