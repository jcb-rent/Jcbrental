import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve("apps/web");
const dist = resolve(root, "dist");
const required = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "registerSW.js",
];
const failures = [];
for (const file of required) {
  if (!existsSync(resolve(dist, file))) failures.push(`Missing PWA output: ${file}`);
}
for (const file of ["src/App.tsx", "src/CustomerPortal.tsx", "src/OwnerPortal.tsx", "src/DriverPortal.tsx"]) {
  if (!existsSync(resolve(root, file))) failures.push(`Missing portal source: ${file}`);
}
if (existsSync(resolve(dist, "index.html"))) {
  const html = readFileSync(resolve(dist, "index.html"), "utf8");
  if (!html.includes('id="root"')) failures.push("Built HTML is missing the React root element");
  if (!html.includes("manifest.webmanifest")) failures.push("Built HTML does not link the PWA manifest");
}
if (existsSync(resolve(dist, "manifest.webmanifest"))) {
  const manifest = JSON.parse(readFileSync(resolve(dist, "manifest.webmanifest"), "utf8"));
  if (manifest.name !== "JCB Rental Service") failures.push("Unexpected PWA manifest name");
  if (manifest.start_url !== "/") failures.push("PWA start_url must be /");
  if (manifest.display !== "standalone") failures.push("PWA display mode must be standalone");
  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) failures.push("PWA manifest has no icons");
}
if (existsSync(resolve(dist, "sw.js"))) {
  const sw = readFileSync(resolve(dist, "sw.js"), "utf8");
  if (!sw.includes("precache")) failures.push("Service worker does not appear to include a precache manifest");
}
if (failures.length) {
  console.error("PWA integration smoke test failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("PWA integration smoke test passed: portals present, app shell built, manifest and service worker verified.");
