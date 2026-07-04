#!/usr/bin/env node
// Dependency-free structural validation for this skill repo.
// Catches the two failure modes that actually break a Claude skill:
//   1. SKILL.md missing its `name` / `description` frontmatter.
//   2. A relative Markdown link pointing at a file that doesn't exist.
// Run with: node validate-skill.mjs   (exits non-zero on any failure)
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const errors = [];

// 1. SKILL.md frontmatter -----------------------------------------------------
const skillPath = join(root, "SKILL.md");
if (!existsSync(skillPath)) {
  errors.push("SKILL.md is missing");
} else {
  // Strip a leading BOM and any leading blank lines — both are common from
  // Windows editors and would otherwise make a valid frontmatter block miss
  // the anchored regex below and report a false "no frontmatter" failure.
  const text = readFileSync(skillPath, "utf8")
    .replace(/^\uFEFF/, "")
    .replace(/^\s*\n/, "");
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!fm) {
    errors.push("SKILL.md has no YAML frontmatter block");
  } else {
    for (const key of ["name", "description"]) {
      if (!new RegExp(`^${key}:`, "m").test(fm[1])) {
        errors.push(`SKILL.md frontmatter is missing "${key}:"`);
      }
    }
  }
}

// 2. Relative Markdown links resolve ------------------------------------------
function mdFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === ".git" || entry === "node_modules") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...mdFiles(full));
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

const linkRe = /\[[^\]]*\]\(([^)]+)\)/g;
const fencedCodeBlockRe = /```[\s\S]*?```/g;
for (const file of mdFiles(root)) {
  // Strip fenced code blocks first — format templates elsewhere in this repo
  // use literal placeholder text like `[link]` inside ``` fences, which would
  // otherwise match the link regex and fail on a file that doesn't exist.
  const text = readFileSync(file, "utf8").replace(fencedCodeBlockRe, "");
  let m;
  while ((m = linkRe.exec(text))) {
    let target = m[1].trim();
    // Skip external links, anchors, and mailto.
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    target = target.split("#")[0]; // drop any anchor fragment
    if (!target) continue;
    if (!existsSync(resolve(dirname(file), target))) {
      errors.push(`${file.replace(root + "/", "")}: broken link -> ${m[1]}`);
    }
  }
}

if (errors.length) {
  console.error("Skill validation FAILED:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("Skill validation passed.");
