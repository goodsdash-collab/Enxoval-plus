import { readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const dir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/lvparts");
const files = readdirSync(dir)
  .filter((f) => /^p\d+\.ts$/.test(f))
  .sort((a, b) => Number(a.slice(1, -3)) - Number(b.slice(1, -3)));
if (!files.length) {
  console.error("No lvparts found in", dir);
  process.exit(1);
}
const parts = files.map((f) => {
  const text = readFileSync(join(dir, f), "utf8");
  const m = text.match(/export const p\d+ = `([\s\S]*?)`;/);
  if (!m) throw new Error("Bad part format: " + f);
  return m[1];
});
const src = Buffer.from(parts.join(""), "base64").toString("utf8");
writeFileSync(join(dir, "../ListView.tsx"), src);
console.log("Assembled ListView.tsx", src.length, "bytes from", parts.length, "parts");
