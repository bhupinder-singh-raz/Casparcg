import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
const CAPTION_ADDED = 'CAPTION_ADDED';

export default {
    captionAdded: {
        subscribe: () => pubsub.asyncIterableIterator(CAPTION_ADDED),
    },
};
