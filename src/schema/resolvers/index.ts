import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import { GraphQLError } from "graphql";
import { AppError, conflict, notFound } from "../../errors/appError";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

function handleError(error: unknown): never {
  if (error instanceof GraphQLError) {
    throw error;
  }

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new GraphQLError(conflict("A unique constraint violation occurred.").message, {
        extensions: { code: "CONFLICT", details: error.meta },
      });
    }

    if (error.code === "P2025") {
      throw new GraphQLError(notFound("Requested record was not found.").message, {
        extensions: { code: "NOT_FOUND", details: error.meta },
      });
    }

    if (error.code === "P2003") {
      throw new GraphQLError("A related record does not exist.", {
        extensions: { code: "BAD_USER_INPUT", details: error.meta },
      });
    }
  }

  if (error instanceof AppError) {
    throw new GraphQLError(error.message, {
      extensions: { code: error.code, statusCode: error.statusCode },
    });
  }

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";
  throw new GraphQLError(message, {
    extensions: { code: "INTERNAL_SERVER_ERROR" },
  });
}

const withErrorHandling = <TArgs, TResult>(
  resolver: (_: unknown, args: TArgs) => Promise<TResult> | TResult
) => {
  return async (_: unknown, args: TArgs): Promise<TResult> => {
    try {
      return await resolver(_, args);
    } catch (error) {
      handleError(error);
    }
  };
};

export const resolvers = {
  Query: {
    users: withErrorHandling(async () => userService.getAllUsers()),
    user: withErrorHandling(async (_: unknown, args: { id: number }) =>
      userService.getUserById(args.id)
    ),
    posts: withErrorHandling(async () => postService.getAllPosts()),
    post: withErrorHandling(async (_: unknown, args: { id: number }) =>
      postService.getPostById(args.id)
    ),
  },

  Mutation: {
    createUser: withErrorHandling(
      async (_: unknown, args: { email: string; name?: string }) =>
        userService.createUser(args)
    ),
    updateUser: withErrorHandling(
      async (_: unknown, args: { id: number; email?: string; name?: string }) =>
        userService.updateUser(args.id, {
          email: args.email,
          name: args.name,
        })
    ),
    deleteUser: withErrorHandling(async (_: unknown, args: { id: number }) =>
      userService.deleteUser(args.id)
    ),
    createPost: withErrorHandling(
      async (
        _: unknown,
        args: { title: string; content?: string; authorId: number }
      ) => postService.createPost(args)
    ),
    updatePost: withErrorHandling(
      async (
        _: unknown,
        args: {
          id: number;
          title?: string;
          content?: string;
          published?: boolean;
        }
      ) => {
        const { id, ...data } = args;
        return postService.updatePost(id, data);
      }
    ),
    deletePost: withErrorHandling(async (_: unknown, args: { id: number }) =>
      postService.deletePost(args.id)
    ),
  },
};
