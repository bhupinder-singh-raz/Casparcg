import { z } from 'zod';
import { DateSchema } from '../common/Date';

export const CaptionFormSchema = z.object({
  playerOut: z.object({
    name: z.string().min(1, 'Player Out name is required'),
    number: z.number().min(1, 'Player Out number is required'),
  }),
  playerIn: z.object({
    name: z.string().min(1, 'Player In name is required'),
    number: z.number().min(1, 'Player In number is required'),
  }),
  substitutionTime: z.string().min(1, 'Substitution time is required'),
  createdAt: DateSchema,
  modifiedAt: DateSchema.optional(),
});
