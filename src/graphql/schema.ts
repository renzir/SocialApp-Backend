import { gql } from "graphql-tag";

export interface PostData {
  id: number;
  user_id: number;
  content?: string | null;
  autor?: string | null;
  imagen_perfil?: string | null;
  created_at: Date;
  images?: string[] | null;
}

export type User = {
  id: number;
  username: string;
  email: string;
  profile_image_url?: string | null;
};

export interface FriendshipRequest {
  sender_id: number;
  receiver_id: number;
  status: "pending" | "accepted" | "cancelled";
}

export interface CommentData {
  id: number;
  post_id: number;
  user_id: number;
  comment: string;
  created_at: Date;
}

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    profile_image_url: String
  }

  type Post {
    id: ID!
    user_id: ID!
    content: String
    images: [String]
    autor: String
    imagen_perfil: String
    created_at: String
  }

  type Comment {
    id: ID!
    post_id: ID!
    user_id: ID!
    comment: String!
    username: String
    created_at: String
  }

  type FriendshipRequest {
    sender_id: ID!
    receiver_id: ID!
    status: String!
  }

  type Query {
    hello: String!
    getMuro: [Post!]!
    getProfile(username: String!): User
    me: User
  }

  type Mutation {
    createPost(content: String!, images: [String]): Post
    sendFriendRequest(friendId: ID!): FriendshipRequest
    createComment(postId: ID!, comment: String!): Comment
  }
`;

export default typeDefs;
