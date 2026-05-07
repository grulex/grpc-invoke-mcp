#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import https from "node:https";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const OWNER = "grulex"; // поменяй, если другой GitHub owner
const REPO = "grpc-invoke-mcp-binary";
const VERSION = "v0.1.0";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const vendorDir = path.join(rootDir, "vendor");

const binaryName = process.platform === "win32"
  ? "grpc-invoke-mcp.exe"
  : "grpc-invoke-mcp";

const binPath = path.join(vendorDir, binaryName);

function target() {
  if (process.platform === "darwin" && process.arch === "arm64") return "darwin_arm64";
  if (process.platform === "darwin" && process.arch === "x64") return "darwin_amd64";
  if (process.platform === "linux" && process.arch === "arm64") return "linux_arm64";
  if (process.platform === "linux" && process.arch === "x64") return "linux_amd64";
  if (process.platform === "win32" && process.arch === "arm64") return "windows_arm64";
  if (process.platform === "win32" && process.arch === "x64") return "windows_amd64";

  throw new Error(`Unsupported platform: ${process.platform} ${process.arch}`);
}

function assetName() {
  const t = target();
  const version = VERSION.slice(1);

  if (t.startsWith("windows")) {
    return `grpc-invoke-mcp_${version}_${t}.zip`;
  }

  return `grpc-invoke-mcp_${version}_${t}.tar.gz`;
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.rmSync(dest, { force: true });
        return download(res.headers.location, dest).then(resolve, reject);
      }

      if (res.statusCode !== 200) {
        file.close();
        fs.rmSync(dest, { force: true });
        return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
      }

      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", err => {
      file.close();
      fs.rmSync(dest, { force: true });
      reject(err);
    });
  });
}

fs.mkdirSync(vendorDir, { recursive: true });

const asset = assetName();
const url = `https://github.com/${OWNER}/${REPO}/releases/download/${VERSION}/${asset}`;
const archivePath = path.join(os.tmpdir(), asset);

console.log(`Downloading ${url}`);

await download(url, archivePath);

if (asset.endsWith(".zip")) {
  execFileSync("unzip", ["-o", archivePath, "-d", vendorDir], { stdio: "inherit" });
} else {
  execFileSync("tar", ["-xzf", archivePath, "-C", vendorDir], { stdio: "inherit" });
}

fs.rmSync(archivePath, { force: true });

if (!fs.existsSync(binPath)) {
  throw new Error(`Binary not found after extraction: ${binPath}`);
}

if (process.platform !== "win32") {
  fs.chmodSync(binPath, 0o755);
}

console.log(`Installed ${binPath}`);
