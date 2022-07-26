import { Prisma } from "@prisma/client";
import { prisma } from "~/server/prisma";
import { TRPCError } from "@trpc/server";
import { createRouter } from "~/server/createRouter";
import { z } from "zod";

const defaultTechSkillLevelSelect =
  Prisma.validator<Prisma.TechSkillLevelSelect>()({
    id: true,
    name: true,
    weight: true
  });


export const techSkillLevelRouter = createRouter()
  .query('all', {
    async resolve() {
      return prisma.techSkillLevel.findMany({
        select: defaultTechSkillLevelSelect,
      });
    },
  })
  .query('byId', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const { id } = input;
      const techSkillLevel = await prisma.techSkillLevel.findUnique({
        where: { id },
        select: defaultTechSkillLevelSelect,
      });
      if (!techSkillLevel) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No tech skill level with id '${id}'`,
        });
      }
      return techSkillLevel;
    },
  });
