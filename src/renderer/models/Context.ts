import type { Logger } from "../../shared/models/Logger";
import type { Main } from "./Main";

export interface AppContext {
	readonly main: Main;
	readonly logger: Logger;
}
