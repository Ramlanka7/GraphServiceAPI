import prisma from "../utils/prismaClient";

export const postRepository = {
  findAll: () => {
    return prisma.post.findMany({
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });
  },

  findById: (id: number) => {
    return prisma.post.findUnique({ where: { id }, include: { author: true } });
  },

  create: (data: { title: string; content?: string; authorId: number }) => {
    return prisma.post.create({ data, include: { author: true } });
  },

  update: (
    id: number,
    data: { title?: string; content?: string; published?: boolean }
  ) => {
    return prisma.post.update({ where: { id }, data, include: { author: true } });
  },

  delete: (id: number) => {
    return prisma.post.delete({ where: { id }, include: { author: true } });
  },
};
