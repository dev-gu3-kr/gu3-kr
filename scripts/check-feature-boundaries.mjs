import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"])
const ignoreDirs = new Set(["node_modules", ".next", "dist", "out", "coverage"])

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue
      walk(full, out)
    } else if (exts.has(path.extname(entry.name))) {
      out.push(full)
    }
  }
  return out
}

const files = walk(root)
const violations = []
const deepAlias =
  /from\s+["']@\/features\/([^/]+)\/(server|client|isomorphic)\/(?!index(?:\.[^"']+)??["'])([^"']+)["']/g

for (const file of files) {
  const rel = path.relative(root, file)
  const text = fs.readFileSync(file, "utf8")

  const matches = [...text.matchAll(deepAlias)]
  for (const m of matches) {
    violations.push(
      `${rel}: deep import not allowed -> @/features/${m[1]}/${m[2]}/${m[3]}`,
    )
  }
}

if (violations.length) {
  console.error("\n[feature-boundary] violations found:\n")
  for (const v of violations) console.error(`- ${v}`)
  console.error(
    "\nUse barrel entry only: @/features/<feature>/<server|client|isomorphic>/index",
  )
  process.exit(1)
}

console.log("[feature-boundary] OK")
