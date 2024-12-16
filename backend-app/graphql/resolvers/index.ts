import queryResolvers from './query';
import mutationResolvers from './mutation';
import subscriptionResolvers from './subscription';

export const resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
  Subscription: subscriptionResolvers,
};
