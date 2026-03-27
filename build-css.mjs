#!/usr/bin/env node

/**
 * Build CSS variables for Bootstrap Icons.
 * Downloads twbs/icons archive from GitHub, extracts SVGs from icons/, and generates dist/bootstrap-icons.css
 */

import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import { optimize } from "svgo";
import yauzl from "yauzl";
import CleanCSS from "clean-css";

const BOOTSTRAP_ICONS_ZIP_URL =
  "https://github.com/twbs/icons/archive/refs/heads/main.zip";
const DIST_DIR = path.join(process.cwd(), "dist");
const TEMP_DIR = path.join(tmpdir(), "bootstrap-icons-css-build");
const CSS_VAR_PREFIX = "--bi-";
const PKG_JSON = JSON.parse(
  fs.readFileSync(new URL("./package.json", import.meta.url), "utf8")
);
const BANNER = `/*! bootstrap-icons-css v${PKG_JSON.version} | MIT License | https://github.com/coliff/bootstrap-icons-css */`;

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: ${res.statusCode} ${res.statusMessage}`));
        return;
      }
      resolve(res);
    }).on("error", reject);
  });
}

/**
 * Slug from path: "icons-main/icons/alarm.svg" or "icons-main/icons/arrow-right.svg" -> "alarm", "arrow-right"
 */
function slugFromPath(entryPath) {
  const parts = entryPath.replace(/\\/g, "/").split("/");
  const fileName = parts[parts.length - 1] || "";
  const name = fileName.replace(/\.svg$/i, "");
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Remove class attribute(s) from SVG to keep data URIs smaller and avoid redundant markup. */
function stripClassFromSvg(svg) {
  return svg.replace(/\s+class="[^"]*"/g, "");
}

/** Remove width/height from SVG; viewBox is enough when used as mask/background. */
function stripDimensionsFromSvg(svg) {
  return svg.replace(/\s+width="[^"]*"/g, "").replace(/\s+height="[^"]*"/g, "");
}

function minifySvg(svg, pathHint = "") {
  const result = optimize(svg, {
    path: pathHint,
    js2svg: { pretty: false },
  });
  return stripDimensionsFromSvg(stripClassFromSvg(result.data));
}

function escapeSvgForCssUrl(svg) {
  const trimmed = svg.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
  return trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function openZip(buffer) {
  return new Promise((resolve, reject) => {
    const opt = { lazyEntries: true };
    yauzl.fromBuffer(buffer, opt, (err, zipfile) => {
      if (err) reject(err);
      else resolve(zipfile);
    });
  });
}

/**
 * Zip from GitHub archive has top-level folder like "icons-main", then "icons/*.svg".
 */
async function extractSvgsFromZip(zipPath) {
  const buffer = fs.readFileSync(zipPath);
  const zipfile = await openZip(buffer);
  const svgByVarName = new Map();
  let svgCount = 0;
  let totalCount = 0;

  await new Promise((resolve, reject) => {
    zipfile.on("entry", (entry) => {
      totalCount++;
      const normalizedPath = entry.fileName.replace(/\\/g, "/");
      if (path.extname(entry.fileName).toLowerCase() !== ".svg") {
        zipfile.readEntry();
        return;
      }
      // Only accept SVGs from the top-level icons/ folder: "icons-main/icons/foo.svg" (GitHub archive)
      const segments = normalizedPath.split("/").filter(Boolean);
      if (segments.length !== 3) {
        zipfile.readEntry();
        return;
      }
      const [root, dirName, fileName] = segments;
      if (root !== "icons-main" || dirName !== "icons" || !fileName.toLowerCase().endsWith(".svg")) {
        zipfile.readEntry();
        return;
      }

      zipfile.openReadStream(entry, (err, readStream) => {
        if (err) {
          zipfile.readEntry();
          return;
        }
        const chunks = [];
        readStream.on("data", (chunk) => chunks.push(chunk));
        readStream.on("end", () => {
          const slug = slugFromPath(entry.fileName);
          const varName = CSS_VAR_PREFIX + slug;
          if (!svgByVarName.has(varName)) {
            const raw = Buffer.concat(chunks).toString("utf8");
            const minified = minifySvg(raw, entry.fileName);
            svgByVarName.set(varName, minified);
            svgCount++;
          }
          zipfile.readEntry();
        });
        readStream.on("error", () => zipfile.readEntry());
      });
    });
    zipfile.on("end", () => resolve(svgByVarName));
    zipfile.on("error", reject);
    zipfile.readEntry();
  });

  console.log(`Zip has ${totalCount} total entries, ${svgCount} unique icon variables.`);
  zipfile.close();
  return svgByVarName;
}

async function main() {
  console.log("Downloading Bootstrap Icons (twbs/icons) archive...");
  const res = await download(BOOTSTRAP_ICONS_ZIP_URL);
  const zipPath = path.join(TEMP_DIR, "bootstrap-icons.zip");
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  await pipeline(res, createWriteStream(zipPath));
  console.log("Extracting and building CSS variables...");

  const svgByVarName = await extractSvgsFromZip(zipPath);

  const lines = [];
  for (const [varName, svg] of svgByVarName) {
    try {
      const escaped = escapeSvgForCssUrl(svg);
      lines.push(`  ${varName}: url("data:image/svg+xml;utf8,${escaped}");`);
    } catch (err) {
      console.warn(`Skip ${varName}:`, err.message);
    }
  }

  fs.mkdirSync(DIST_DIR, { recursive: true });
  const docsDir = path.join(process.cwd(), "docs");
  fs.mkdirSync(docsDir, { recursive: true });

  const cssPath = path.join(DIST_DIR, "bootstrap-icons.css");
  const iconNames = [...svgByVarName.keys()].map((k) => k.slice(CSS_VAR_PREFIX.length));
  const classRules = iconNames
    .sort()
    .map((name) => `.bi-${name} {\n  mask-image: var(${CSS_VAR_PREFIX}${name});\n}`)
    .join("\n");
  const utilityCss = `
[class^="bi-"],
[class*=" bi-"] {
  background-color: currentColor;
  display: inline-block;
  height: 1rem;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
  width: 1rem;
}

${classRules}
`;
  const cssContent = `${BANNER}\n\n:root {\n${lines.join("\n")}\n}\n${utilityCss}`;
  fs.writeFileSync(cssPath, cssContent, "utf8");
  console.log(`Wrote ${cssPath} with ${lines.length} icon variables.`);

  fs.copyFileSync(cssPath, path.join(docsDir, "bootstrap-icons.css"));

  const minPath = path.join(DIST_DIR, "bootstrap-icons.min.css");
  const minifier = new CleanCSS({ level: 2 });
  const minResult = minifier.minify(cssContent);
  if (minResult.errors.length > 0) {
    throw new Error("CleanCSS: " + minResult.errors.join("; "));
  }
  fs.writeFileSync(minPath, minResult.styles, "utf8");
  console.log("Wrote", minPath);
  fs.copyFileSync(minPath, path.join(docsDir, "bootstrap-icons.min.css"));

  const iconList = [...svgByVarName.keys()].map((k) => k.slice(CSS_VAR_PREFIX.length));
  fs.writeFileSync(
    path.join(docsDir, "icon-list.json"),
    JSON.stringify(iconList.sort(), null, 0),
    "utf8"
  );

  try {
    fs.unlinkSync(zipPath);
    fs.rmdirSync(TEMP_DIR);
  } catch {
    // ignore
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
