export function loader() {
  return new Response("ok", { headers: { "Cache-Control": "no-store" } });
}
