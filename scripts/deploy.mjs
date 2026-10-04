// Despliega Korokotico en Fly.io con un solo comando: `pnpm release`.
//   1. despliega el CMS (apps/cms) y espera a que responda /server/ping
//   2. corre el seed contra producción (esquema y permisos; no pisa contenido existente)
//   3. despliega la web (apps/web) y comprueba que la home responde 200
//
// Flags: --cms (solo el CMS) · --web (solo la web) · --skip-seed
//        --target=<nombre> usa fly.<nombre>.toml y .env.fly.<nombre> (p. ej. --target=cliente,
//        la org daniela-zarraga). Sin --target usa fly.toml y .env.fly.
// Credenciales: .env.fly en la raíz (ver .env.fly.example). Requiere `fly auth login`.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REQUIRED = ["ADMIN_EMAIL", "ADMIN_PASSWORD", "WEBSITE_TOKEN"];

const args = new Set(process.argv.slice(2));
const target = process.argv.find((a) => a.startsWith("--target="))?.slice("--target=".length);
const FLY_TOML = target ? `fly.${target}.toml` : "fly.toml";
const ENV_NAME = target ? `.env.fly.${target}` : ".env.fly";
const ENV_FILE = join(ROOT, ENV_NAME);
const onlyCms = args.has("--cms");
const onlyWeb = args.has("--web");
const doCms = onlyCms || !onlyWeb;
const doWeb = onlyWeb || !onlyCms;
const doSeed = doCms && !args.has("--skip-seed");

const log = (msg) => console.log(`\n▸ ${msg}`);
const fail = (msg) => {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
};

function run(cmd, cmdArgs, { cwd = ROOT, env, capture = false } = {}) {
  const res = spawnSync(cmd, cmdArgs, {
    cwd,
    env: { ...process.env, ...env },
    stdio: capture ? "pipe" : "inherit",
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (res.status !== 0) {
    if (capture) console.error(`${res.stdout ?? ""}${res.stderr ?? ""}`);
    fail(`Falló: ${cmd} ${cmdArgs.join(" ")}`);
  }
  return res.stdout ?? "";
}

function readToml(path, key) {
  const match = readFileSync(join(ROOT, path), "utf8").match(new RegExp(`^\\s*${key}\\s*=\\s*"([^"]+)"`, "m"));
  if (!match) fail(`No encontré ${key} en ${path}`);
  return match[1];
}

function readEnvFly() {
  if (!existsSync(ENV_FILE)) {
    fail(`Falta ${ENV_NAME} en la raíz. Cópialo de .env.fly.example y completa: ${REQUIRED.join(", ")}.`);
  }
  const env = {};
  for (const line of readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  const missing = REQUIRED.filter((k) => !env[k]);
  if (missing.length) fail(`A ${ENV_NAME} le faltan: ${missing.join(", ")}`);
  return env;
}

async function waitFor(url, check, label) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (await check(res)) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 5000));
  }
  fail(`${label} no respondió a tiempo (${url})`);
}

log("Comprobando la sesión de Fly");
const who = run("fly", ["auth", "whoami"], { capture: true }).trim().split(/\r?\n/).pop();
console.log(`  Sesión: ${who}`);

const cmsApp = readToml(`apps/cms/${FLY_TOML}`, "app");
const cmsUrl = readToml(`apps/cms/${FLY_TOML}`, "PUBLIC_URL").replace(/\/$/, "");
const webApp = readToml(`apps/web/${FLY_TOML}`, "app");
const webUrl = readToml(`apps/web/${FLY_TOML}`, "SITE_URL").replace(/\/$/, "");
const creds = doSeed ? readEnvFly() : null;

if (doCms) {
  log(`Desplegando el CMS (${cmsApp})`);
  run("fly", ["deploy", "--config", FLY_TOML, "--remote-only", "--ha=false"], { cwd: join(ROOT, "apps/cms") });

  log("Esperando a que el CMS responda");
  await waitFor(`${cmsUrl}/server/ping`, async (r) => r.ok && (await r.text()).trim() === "pong", "El CMS");
  console.log("  pong ✔");
}

if (doSeed) {
  log("Aplicando esquema y permisos en producción (seed)");
  run("node", ["scripts/seed.mjs"], {
    cwd: join(ROOT, "apps/cms"),
    env: {
      DIRECTUS_URL: cmsUrl,
      SITE_URL: webUrl,
      ADMIN_EMAIL: creds.ADMIN_EMAIL,
      ADMIN_PASSWORD: creds.ADMIN_PASSWORD,
      WEBSITE_TOKEN: creds.WEBSITE_TOKEN,
    },
  });
}

if (doWeb) {
  log(`Desplegando la web (${webApp})`);
  run("fly", [
    "deploy",
    ".",
    "--config",
    `apps/web/${FLY_TOML}`,
    "--dockerfile",
    "apps/web/Dockerfile",
    "--remote-only",
    "--ha=false",
  ]);

  log("Comprobando la web");
  await waitFor(`${webUrl}/`, async (r) => r.status === 200, "La web");
  console.log("  200 ✔");
}

log(`Listo ✔  Web: ${webUrl}/  ·  CMS: ${cmsUrl}/admin`);
