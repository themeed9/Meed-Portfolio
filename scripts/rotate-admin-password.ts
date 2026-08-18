import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

class RotationError extends Error {}

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new RotationError(`Rotation stopped: ${name} is not configured.`);
  return value;
}

async function rotateAdminPassword() {
  const databaseUrl = requiredEnvironmentVariable("DATABASE_URL");
  const adminEmail = requiredEnvironmentVariable("ADMIN_EMAIL");
  const adminPassword = requiredEnvironmentVariable("ADMIN_PASSWORD");
  const oldAdminPassword = process.env.OLD_ADMIN_PASSWORD;

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    await prisma.$transaction(async (transaction) => {
      const matchingUsers = await transaction.user.findMany({
        where: { email: adminEmail },
        select: { id: true },
        take: 2,
      });

      if (matchingUsers.length === 0) {
        throw new RotationError("Rotation stopped: admin user was not found.");
      }

      if (matchingUsers.length > 1) {
        throw new RotationError("Rotation stopped: more than one admin user matched.");
      }

      console.log("Admin user found");

      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await transaction.user.update({
        where: { id: matchingUsers[0].id },
        data: { password: passwordHash },
        select: { id: true },
      });

      console.log("Password hash updated");

      const updatedUser = await transaction.user.findUnique({
        where: { id: matchingUsers[0].id },
        select: { password: true },
      });

      if (!updatedUser || !(await bcrypt.compare(adminPassword, updatedUser.password))) {
        throw new RotationError("Rotation stopped: new password verification failed.");
      }

      console.log("New password verification passed");

      if (oldAdminPassword !== undefined) {
        if (await bcrypt.compare(oldAdminPassword, updatedUser.password)) {
          throw new RotationError("Rotation stopped: old password verification did not fail.");
        }
        console.log("Old password verification failed as expected");
      }
    });

    console.log("Rotation complete");
  } finally {
    await prisma.$disconnect();
  }
}

rotateAdminPassword().catch((error: unknown) => {
  if (error instanceof RotationError) {
    console.error(error.message);
  } else {
    console.error("Rotation failed before completion.");
  }
  process.exitCode = 1;
});
