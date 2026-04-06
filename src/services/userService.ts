import { userRepository } from "../repositories/userRepository";
import { badRequest, notFound } from "../errors/appError";
import { assertPositiveInt, assertValidEmail } from "../utils/validation";

export const userService = {
  getAllUsers: () => {
    return userRepository.findAll();
  },

  getUserById: (id: number) => {
    assertPositiveInt(id, "id");
    return userRepository.findById(id);
  },

  createUser: (data: { email: string; name?: string }) => {
    assertValidEmail(data.email);
    return userRepository.create(data);
  },

  updateUser: async (id: number, data: { email?: string; name?: string }) => {
    assertPositiveInt(id, "id");

    if (data.email === undefined && data.name === undefined) {
      throw badRequest("At least one field must be provided for update.");
    }

    if (data.email !== undefined) {
      assertValidEmail(data.email);
    }

    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw notFound(`User with id ${id} was not found.`);
    }

    return userRepository.update(id, data);
  },

  deleteUser: async (id: number) => {
    assertPositiveInt(id, "id");

    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw notFound(`User with id ${id} was not found.`);
    }

    return userRepository.delete(id);
  },
};
