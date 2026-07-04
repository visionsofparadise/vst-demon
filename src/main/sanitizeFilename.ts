const HOSTILE_CHARACTERS = /[\\/:*?"<>|\s-]+/g;
const LEADING_TRAILING_UNDERSCORES = /^_+|_+$/g;

export const sanitizeFilename = (name: string): string => {
	const replaced = name.replace(HOSTILE_CHARACTERS, "_").replace(LEADING_TRAILING_UNDERSCORES, "");

	return replaced.length === 0 ? "untitled" : replaced;
};
