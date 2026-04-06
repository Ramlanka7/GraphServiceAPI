import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema/typeDefs";
import { resolvers } from "./schema/resolvers";
import prisma from "./utils/prismaClient";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required.");
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== "production",
});

const PORT = Number(process.env.PORT) || 4000;

async function bootstrap(): Promise<void> {
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  });

  const shutdown = async (signal: NodeJS.Signals) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    await server.stop();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log(`Server ready at ${url}`);
}

bootstrap().catch(async (error) => {
  console.error("Failed to start server", error);
  await prisma.$disconnect();
  process.exit(1);
});
