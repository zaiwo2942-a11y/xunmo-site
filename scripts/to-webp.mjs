import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, parse, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "images");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.jpe?g$/i.test(name)) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let savedBefore = 0;
let savedAfter = 0;

for (const src of files) {
  const { dir, name } = parse(src);
  const dst = join(dir, `${name}.webp`);
  const before = statSync(src).size;
  await sharp(src)
    .webp({ quality: 80, effort: 5 })
    .toFile(dst);
  const after = statSync(dst).size;
  savedBefore += before;
  savedAfter += after;
  const rel = src.slice(ROOT.length + 1).replace(/\\/g, "/");
  console.log(
    `${rel}: ${(before / 1024).toFixed(0)}K → ${(after / 1024).toFixed(0)}K (${Math.round((1 - after / before) * 100)}% smaller)`
  );
}

console.log(
  `\nTotal: ${(savedBefore / 1024).toFixed(0)}K → ${(savedAfter / 1024).toFixed(0)}K (saved ${Math.round((1 - savedAfter / savedBefore) * 100)}%)`
);
