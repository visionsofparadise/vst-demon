import { z } from "zod";

export const settingsSchema = z.object({
	scanRoots: z.array(z.string()),
});

export type Settings = z.infer<typeof settingsSchema>;

export const parseSettings = (raw: string): Settings | undefined => {
	let json: unknown;

	try {
		json = JSON.parse(raw);
	} catch {
		return undefined;
	}

	const result = settingsSchema.safeParse(json);

	return result.success ? result.data : undefined;
};

export const serializeSettings = (settings: Settings): string => JSON.stringify(settings, null, "\t");
