import { z } from "zod";

const readyEventSchema = z.object({ event: z.literal("ready") });
const openEventSchema = z.object({ event: z.literal("open"), path: z.string() });
const savedEventSchema = z.object({ event: z.literal("saved"), path: z.string() });
const closedEventSchema = z.object({ event: z.literal("closed") });

export const cliEventSchema = z.discriminatedUnion("event", [readyEventSchema, openEventSchema, savedEventSchema, closedEventSchema]);

export type CliStdoutEvent = z.infer<typeof cliEventSchema>;

export interface CliExitedEvent { readonly event: "exited"; readonly code: number | null; readonly stderrTail: string }

export type CliEvent = CliStdoutEvent | CliExitedEvent;

export const parseCliLine = (line: string): CliStdoutEvent | undefined => {
	const trimmed = line.trim();

	if (trimmed.length === 0) return undefined;

	try {
		const parsed: unknown = JSON.parse(trimmed);
		const result = cliEventSchema.safeParse(parsed);

		return result.success ? result.data : undefined;
	} catch {
		return undefined;
	}
};
