import { authResolvers } from "../modules/auth/auth.resolvers.js";
import { commentResolvers } from "../modules/comment/comment.resolvers.js";
import { friendshipResolvers } from "../modules/friendships/friendship.resolvers.js";
import { postResolvers } from "../modules/post/post.resolvers.js";
import { userResolvers } from "../modules/user/user.resolvers.js";

export const resolvers = {
  Query: {
    hello: () => "¡Hola! Servidor GraphQL funcionando correctamente 🚀",
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...commentResolvers.Query,
    ...friendshipResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...friendshipResolvers.Mutation,
  },
};
