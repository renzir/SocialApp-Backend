export const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    email: String!
    profile_image_url: String
    banner_image_url: String
    bio: String
    is_active: Boolean
    email_verified: Boolean
    created_at: String
  }

  type PostImage {
    id: ID!
    post_id: ID!
    image_url: String!
    order_index: Int
    created_at: String
  }

  type Post {
    id: ID!
    user_id: ID!
    content: String!
    images: [PostImage!]
    autor: String
    imagen_perfil: String
    created_at: String
    updated_at: String
  }

  type Comment {
    id: ID!
    post_id: ID!
    user_id: ID!
    content: String!
    username: String
    perfil_imagen: String
    created_at: String!
    updated_at: String
  }

  type Friendship {
    id: ID!
    sender_id: ID!
    receiver_id: ID!
    status: String!
    created_at: String
    updated_at: String
  }

  type AuthPayload {
    success: Boolean!
    message: String!
    user: User
    accessToken: String
  }

  type AuthResponse {
    success: Boolean!
    message: String!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    username: String! # Puede ser username o email
    password: String!
  }
  type Query {
    hello: String!
    getMuro: [Post!]!
    getProfile(username: String!): User
    me: User
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: AuthPayload!
    verifyEmail(token: String!): AuthPayload! # <-- Nueva mutación
    createPost(content: String!, images: [String]): Post
    createComment(postId: ID!, content: String!): Comment
    sendFriendRequest(friendId: ID!): AuthResponse
    acceptFriendRequest(requestId: ID!): AuthResponse
  }
`;

