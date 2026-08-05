import { readFile } from "node:fs/promises"

const projectRoot = new URL("../", import.meta.url)

const [defaultSeed, pastoralSeed, prismaConfig, packageJsonSource] =
  await Promise.all([
    readFile(new URL("prisma/seed.ts", projectRoot), "utf8"),
    readFile(new URL("prisma/seed-pastoral-council.ts", projectRoot), "utf8"),
    readFile(new URL("prisma.config.ts", projectRoot), "utf8"),
    readFile(new URL("package.json", projectRoot), "utf8"),
  ])

const violations = []

if (/pastoral[\s_-]*council/i.test(defaultSeed)) {
  violations.push("prisma/seed.ts must not reference the pastoral council seed")
}

if (!prismaConfig.includes('seed: "tsx ./prisma/seed.ts"')) {
  violations.push("Prisma's default seed must point only to prisma/seed.ts")
}

if (
  !pastoralSeed.includes("createMany") ||
  !pastoralSeed.includes("assignedPositionIds") ||
  pastoralSeed.includes(".upsert(") ||
  pastoralSeed.includes(".update(")
) {
  violations.push(
    "The pastoral council seed must remain insert-only with assigned positions skipped",
  )
}

if (
  !pastoralSeed.includes(
    'process.env.PASTORAL_COUNCIL_SEED_CONFIRM !== "INSERT_ONLY"',
  )
) {
  violations.push(
    "The pastoral council seed must require explicit confirmation",
  )
}

const packageJson = JSON.parse(packageJsonSource)
if (
  packageJson.scripts?.["db:seed:pastoral-council"] !==
  "tsx ./prisma/seed-pastoral-council.ts"
) {
  violations.push(
    "The manual pastoral council seed command is missing or changed",
  )
}

if (violations.length > 0) {
  console.error(violations.map((message) => `- ${message}`).join("\n"))
  process.exit(1)
}

console.log("Seed boundaries are valid.")
