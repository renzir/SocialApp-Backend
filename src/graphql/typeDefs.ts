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
    like_count: Int
    has_liked: Boolean
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
    like_count: Int
    has_liked: Boolean
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

  type Notification {
    id: ID!
    type: String!
    is_read: Boolean!
    created_at: String!
    sender_id: ID!
    sender_username: String
    sender_profile_image: String
    post_id: ID
    comment_id: ID
  }

  type AuthPayload {
    success: Boolean!
    message: String!
    user: User
    accessToken: String
  }

  type RefreshTokenPayload {
    success: Boolean!
    message: String!
    accessToken: String
  }

  type AuthResponse {
    success: Boolean!
    message: String!
  }

  type MuroResponse {
    posts: [Post!]!
    total_count: Int!
    has_more: Boolean!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input UpdateProfileInput {
    bio: String
    banner_image_url: String
    profile_image_url: String
  }

  type Query {
    hello: String!
    getMuro(limit: Int = 20, offset: Int = 0): MuroResponse!
    getProfile(username: String!): User
    searchUsers(query: String!, limit: Int): [User!]!
    me: User
    friendsList(userId: ID!): [User!]!
    getSuggestedUsers(userId: ID!): [User!]!
    getPostById(postId: ID!): Post
    getAllPosts: [Post!]!
    getComments(postId: ID!, limit: Int = 20, offset: Int = 0): [Comment!]!
    getFriendshipStatus(friendId: ID!): String
    getPostLikeCount(postId: ID!): Int!
    getCommentLikeCount(commentId: ID!): Int!
    checkPostLike(postId: ID!, userId: ID!): Boolean!
    checkCommentLike(commentId: ID!, userId: ID!): Boolean!
    getUserNotifications: [Notification!]!
    getUnreadNotificationsCount: Int!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken: RefreshTokenPayload!
    logout: AuthPayload!
    verifyEmail(token: String!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): User!
    createPost(content: String!, images: [String]): Post
    modifyPost(postId: ID!, content: String!, images: [String]): Post
    deletePost(postId: ID!): AuthResponse!
    createComment(postId: ID!, content: String!): Comment
    deleteComment(commentId: ID!): AuthResponse!
    sendFriendRequest(friendId: ID!): AuthResponse
    acceptFriendRequest(requestId: ID!): AuthResponse
    cancelFriendRequest(friendId: ID!): AuthResponse
    blockUser(userId: ID!): AuthResponse!
    unblockUser(userId: ID!): AuthResponse!
    addLikePost(postId: ID!): AuthResponse!
    removeLikePost(postId: ID!): AuthResponse!
    addLikeComment(commentId: ID!): AuthResponse!
    removeLikeComment(commentId: ID!): AuthResponse!
    markNotificationAsRead(notificationId: ID!): AuthResponse!
    markAllNotificationsAsRead: AuthResponse!
  }
`;
