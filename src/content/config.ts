import { defineCollection, z } from "astro:content";

const membersCollection = defineCollection({
	type: "data",
	schema: ({ image }) =>
		z.object({
			id: z.number(),
			group: z.number(),
			name: z.string(),
			position: z.string(),
			department: z.string(),
			photo: image(),
		}),
});

export const collections = {
	"members": membersCollection,
};
