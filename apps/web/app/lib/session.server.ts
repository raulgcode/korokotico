import { createCookieSessionStorage } from "react-router";

type CartSession = { items: number[] };

const secret = process.env.SESSION_SECRET ?? "korokotico-dev-secret";
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  console.warn("[session] Falta SESSION_SECRET en producción");
}

export const sessionStorage = createCookieSessionStorage<CartSession>({
  cookie: {
    name: "__korokotico",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    secrets: [secret],
    maxAge: 60 * 60 * 24 * 30,
  },
});

export async function getCart(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return { session, items: session.get("items") ?? [] };
}
