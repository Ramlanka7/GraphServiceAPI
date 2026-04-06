import prisma from "../utils/prismaClient";

export const userRepository = {
  findAll: () => {
    return prisma.user.findMany({
      include: { posts: true },
      orderBy: { createdAt: "desc" },
    });
  },

  findById: (id: number) => {
    return prisma.user.findUnique({ where: { id }, include: { posts: true } });
  },

  create: (data: { email: string; name?: string }) => {
    return prisma.user.create({ data, include: { posts: true } });
  },

  update: (id: number, data: { email?: string; name?: string }) => {
    return prisma.user.update({ where: { id }, data, include: { posts: true } });
  },

  delete: (id: number) => {
    return prisma.user.delete({ where: { id }, include: { posts: true } });
  },
};
