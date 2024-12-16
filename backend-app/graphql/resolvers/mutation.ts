import { PubSub } from 'graphql-subscriptions';
import { CaptionFormSchema } from '../../models/db/caption.model';
import DBService from '../../services/db.service';
import CasparCGService from '../../services/casperCG.service';
import { CgAddParameters } from 'casparcg-connection';
import ConstantsService from '../../services/constants.service';

const pubsub = new PubSub();
const CAPTION_ADDED = 'CAPTION_ADDED';

export default {
  createCaption: async (_: any, args: any) => {
    const db = DBService.getDb();

    // Validate input
    const validatedInput = CaptionFormSchema.parse(args);
    const newCaption = { ...validatedInput, createdAt: new Date().toISOString() };

    // Insert into DB
    const result = await db.collection('captions').insertOne(newCaption);

    // Connect to CasparCG
    const casperCgInstance = new CasparCGService();
    try {
      casperCgInstance.connect();

      const addData: CgAddParameters = {
        channel: ConstantsService.CASPARCG_CHANNEL,
        cgLayer: ConstantsService.CASPARCG_CG_LAYER,
        layer: ConstantsService.CASPARCG_LAYER,
        template: 'substitution',
        playOnLoad: true,
        data: {
          playerOut: newCaption.playerOut.name,
          playerOutNumber: newCaption.playerOut.number,
          playerIn: newCaption.playerIn.name,
          playerInNumber: newCaption.playerIn.number,
          substitutionTime: newCaption.substitutionTime,
        },
      };

      /* Temp testing */
      await casperCgInstance.sendAddCommand(addData);

      await casperCgInstance.sendTimeoutCommand(
        { channel: addData.channel, layer: addData.layer, cgLayer: addData.cgLayer },
        10000
      );
    } catch (err) {
      console.error('Error interacting with CasparCG:', err);
      throw err;
    } finally {
      casperCgInstance.close();
    }

    pubsub.publish(CAPTION_ADDED, { captionAdded: newCaption });

    return { id: result.insertedId, ...newCaption };
  },
};
