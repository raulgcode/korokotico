import type { DeliveryType } from "./types";

/** Cómo quiere el cliente su pedido (mismos valores que orders.delivery_type en el CMS) */
export const DELIVERY_OPTIONS: { value: DeliveryType; label: string; description: string }[] = [
  { value: "listo", label: "Listo para jugar", description: "Nosotros lo cosemos y te llega terminado." },
  { value: "materiales", label: "Materiales para coser en casa", description: "Te enviamos las piezas y materiales para que lo cosas tú." },
];

export const deliveryLabel = (value: string | null | undefined) =>
  DELIVERY_OPTIONS.find((o) => o.value === value)?.label ?? DELIVERY_OPTIONS[0].label;
