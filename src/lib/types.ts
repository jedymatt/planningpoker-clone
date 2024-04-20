import { z } from 'zod';

export const UserSchema = z.object({
  uid: z.string(),
  displayName: z.string(),
  isAnonymous: z.boolean(),
});

export type User = z.infer<typeof UserSchema>;

export const RoomSchema = z.object({
  name: z.string(),
  cards: z.string().array(),
  players: z
    .object({
      userId: z.string(),
      displayName: z.string(),
    })
    .array()
    .optional()
    .default([]),
  votes: z
    .record(
      z.string().describe('user id'),
      z.string().nullish().describe('card'),
    )
    .optional()
    .default({}),
  revealCards: z.boolean().default(false),
});

export const RoomCreatedSchema = RoomSchema.extend({
  id: z.string(),
});

export type Room = z.infer<typeof RoomSchema>;
export type RoomCreated = z.infer<typeof RoomCreatedSchema>;
