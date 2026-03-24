// Compiled seed script for production (no tsx needed)
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const dropzoneData = require("./dropzones.json");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const systemUser = await prisma.user.upsert({
    where: { email: "system@spotboard.xyz" },
    update: {},
    create: {
      email: "system@spotboard.xyz",
      name: "Spotboard",
    },
  });

  const entries = dropzoneData.Dropzones[0];
  const slugsSeen = new Set();
  let created = 0;
  let skipped = 0;

  for (const [code, dz] of Object.entries(entries)) {
    let slug = generateSlug(dz.Dropzone);

    if (slugsSeen.has(slug)) {
      slug = `${slug}-${code.toLowerCase()}`;
    }
    slugsSeen.add(slug);

    const existing = await prisma.dropzone.findUnique({ where: { slug } });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.dropzone.create({
      data: {
        name: dz.Dropzone,
        slug,
        lat: dz.lat,
        lon: dz.lon,
        airportCode: code,
        ownerId: systemUser.id,
      },
    });
    created++;
  }

  console.log(`Seeded ${created} dropzones (${skipped} skipped)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
