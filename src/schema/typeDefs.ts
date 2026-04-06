import { gql } from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    name: String
    posts: [Post!]!
    createdAt: String!
    updatedAt: String!
  }

  type Post {
    id: Int!
    title: String!
    content: String
    published: Boolean!
    author: User!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
    posts: [Post!]!
    post(id: Int!): Post
  }

  type Mutation {
    createUser(email: String!, name: String): User!
    updateUser(id: Int!, email: String, name: String): User!
    deleteUser(id: Int!): User!
    createPost(title: String!, content: String, authorId: Int!): Post!
    updatePost(
      id: Int!
      title: String
      content: String
      published: Boolean
    ): Post!
    deletePost(id: Int!): Post!
  }
`;
