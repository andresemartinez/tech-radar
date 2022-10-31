/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const frontEndCategoryId = '2faf398a-f772-4a07-8e5d-2369ddebccb6';
  await prisma.technologyCategory.upsert({
    where: {
      id: frontEndCategoryId,
    },
    create: {
      id: frontEndCategoryId,
      name: 'Front-End',
    },
    update: {},
  });

  const backEndCategoryId = '362ee413-1cae-43e5-add1-b19f754396b7';
  await prisma.technologyCategory.upsert({
    where: {
      id: backEndCategoryId,
    },
    create: {
      id: backEndCategoryId,
      name: 'Back-End',
    },
    update: {},
  });

  const reactTechId = '4ced592d-da4b-4df8-9540-c9cbb606dc9e';
  await prisma.technology.upsert({
    where: {
      id: reactTechId,
    },
    create: {
      id: reactTechId,
      name: 'ReactJS',
      description: "Facebook's awesome front end library",
      categories: {
        connect: {
          id: frontEndCategoryId,
        },
      },
    },
    update: {},
  });

  const angularTechId = 'fb9feef4-6db4-4eab-ad84-1af2d8b82ba8';
  await prisma.technology.upsert({
    where: {
      id: angularTechId,
    },
    create: {
      id: angularTechId,
      name: 'Angular',
      description: "Google's awesome front end framework",
      categories: {
        connect: {
          id: frontEndCategoryId,
        },
      },
    },
    update: {},
  });

  const springTechId = 'ea26cde1-17fa-4843-a0b9-cf66c0616470';
  await prisma.technology.upsert({
    where: {
      id: springTechId,
    },
    create: {
      id: springTechId,
      name: 'Spring',
      description: "Java's favorite framework",
      categories: {
        connect: {
          id: backEndCategoryId,
        },
      },
    },
    update: {},
  });

  const proTechSkillLevelId = 'ae466d2b-2936-4705-9f0e-972874d19c9a';
  await prisma.techSkillLevel.upsert({
    where: {
      id: proTechSkillLevelId,
    },
    create: {
      id: proTechSkillLevelId,
      name: 'Pro',
      weight: 100,
    },
    update: {},
  });

  const mehTechSkillLevelId = 'f7d9390b-4c74-4ec8-9c9c-8ddbcb29dc78';
  await prisma.techSkillLevel.upsert({
    where: {
      id: mehTechSkillLevelId,
    },
    create: {
      id: mehTechSkillLevelId,
      name: 'Meh',
      weight: 50,
    },
    update: {},
  });

  const pichiTechSkillLevelId = '80e74e13-2008-4566-985c-089825924c5a';
  await prisma.techSkillLevel.upsert({
    where: {
      id: pichiTechSkillLevelId,
    },
    create: {
      id: pichiTechSkillLevelId,
      name: 'Pichi',
      weight: 10,
    },
    update: {},
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
