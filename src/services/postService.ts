import { postRepository } from "../repositories/postRepository";
import { userRepository } from "../repositories/userRepository";
import { badRequest, notFound } from "../errors/appError";
import { assertNonEmptyTitle, assertPositiveInt } from "../utils/validation";

export const postService = {
  getAllPosts: () => {
    return postRepository.findAll();
  },

  getPostById: (id: number) => {
    assertPositiveInt(id, "id");
    return postRepository.findById(id);
  },

  createPost: async (data: {
    title: string;
    content?: string;
    authorId: number;
  }) => {
    assertNonEmptyTitle(data.title, "Post title is required.");
    assertPositiveInt(data.authorId, "authorId");

    const author = await userRepository.findById(data.authorId);
    if (!author) {
      throw notFound(`Author with id ${data.authorId} was not found.`);
    }

    return postRepository.create(data);
  },

  updatePost: async (
    id: number,
    data: { title?: string; content?: string; published?: boolean }
  ) => {
    assertPositiveInt(id, "id");

    if (
      data.title === undefined &&
      data.content === undefined &&
      data.published === undefined
    ) {
      throw badRequest("At least one field must be provided for update.");
    }

    if (data.title !== undefined) {
      assertNonEmptyTitle(data.title, "Post title cannot be empty.");
    }

    const existingPost = await postRepository.findById(id);
    if (!existingPost) {
      throw notFound(`Post with id ${id} was not found.`);
    }

    return postRepository.update(id, data);
  },

  deletePost: async (id: number) => {
    assertPositiveInt(id, "id");

    const existingPost = await postRepository.findById(id);
    if (!existingPost) {
      throw notFound(`Post with id ${id} was not found.`);
    }

    return postRepository.delete(id);
  },
};
