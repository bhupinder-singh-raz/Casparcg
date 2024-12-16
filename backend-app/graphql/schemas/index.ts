import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Player {
    name: String!
    number: Int!
  }

  type Caption {
    playerOut: Player!
    playerIn: Player!
    timeOfSubstitution: String!
  }

  type Query {
    captions: [Caption!]!
  }

  type Mutation {
    createCaption(playerOut: PlayerInput!, playerIn: PlayerInput!, timeOfSubstitution: String!): Caption!
  }

  type Subscription {
    captionAdded: Caption!
  }

  input PlayerInput {
    name: String!
    number: Int!
  }
`;
