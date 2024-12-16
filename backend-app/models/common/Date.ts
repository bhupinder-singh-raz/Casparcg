import { z } from "zod";

export const DateSchema = z.date().or(z.string()).pipe(z.coerce.date());
