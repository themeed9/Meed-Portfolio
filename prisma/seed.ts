import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { fallbackAbout, fallbackHero, fallbackProjects, fallbackWorkflow } from "../lib/defaults";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed the database.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (email && password) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: "Abdulhameed Abdulsalam", password: await bcrypt.hash(password, 12), role: "admin" },
    });
  } else {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD is not set; no admin account was created.");
  }

  for (const project of fallbackProjects) {
    const { images: _images, caseStudySections, ...data } = project;
    void _images;
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        ...data,
        caseStudySections: {
          deleteMany: {},
          create: caseStudySections.map(({ id, ...section }) => { void id; return section; }),
        },
      },
      create: {
        ...data,
        caseStudySections: { create: caseStudySections.map(({ id, ...section }) => { void id; return section; }) },
      },
    });
  }

  const content = [
    { key: "homepage-hero", value: fallbackHero },
    { key: "homepage-about", value: fallbackAbout },
    { key: "homepage-workflow", value: fallbackWorkflow },
  ];

  for (const item of content) {
    await prisma.siteContent.upsert({ where: { key: item.key }, update: { value: item.value }, create: item });
  }

  console.log("Evidence-safe portfolio seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
