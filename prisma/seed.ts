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
      description: "Java's favourite framework",
      categories: {
        connect: {
          id: frontEndCategoryId,
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

  const maxiProfId = 'ae466d2b-2936-4705-9f0e-972874d19c9a';
  await prisma.professional.upsert({
    where: {
      id: maxiProfId,
    },
    create: {
      id: maxiProfId,
      firstName: 'Maxi',
      lastName: 'Britez',
      email: 'maxi@email.com',
      techSkills: {
        create: [
          {
            technology: {
              connect: {
                id: reactTechId,
              },
            },
            level: {
              connect: {
                id: proTechSkillLevelId,
              },
            },
          },
          {
            technology: {
              connect: {
                id: angularTechId,
              },
            },
            level: {
              connect: {
                id: pichiTechSkillLevelId,
              },
            },
          },
          {
            technology: {
              connect: {
                id: springTechId,
              },
            },
            level: {
              connect: {
                id: mehTechSkillLevelId,
              },
            },
          },
        ],
      },
    },
    update: {},
  });

  const andyProfId = 'cd7f58e0-829a-4e13-b79c-75a305d0ca5a';
  await prisma.professional.upsert({
    where: {
      id: andyProfId,
    },
    create: {
      id: andyProfId,
      firstName: 'Andres',
      lastName: 'Martinez',
      email: 'some@email.com',
      techSkills: {
        create: [
          {
            technology: {
              connect: {
                id: reactTechId,
              },
            },
            level: {
              connect: {
                id: pichiTechSkillLevelId,
              },
            },
          },
          {
            technology: {
              connect: {
                id: angularTechId,
              },
            },
            level: {
              connect: {
                id: proTechSkillLevelId,
              },
            },
          },
          {
            technology: {
              connect: {
                id: springTechId,
              },
            },
            level: {
              connect: {
                id: mehTechSkillLevelId,
              },
            },
          },
        ],
      },
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
