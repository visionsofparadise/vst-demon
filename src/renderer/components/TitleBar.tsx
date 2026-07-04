import type { CSSProperties } from "react";
import { Logo } from "./Logo";

export function TitleBar() {
	return (
		<div
			className="relative flex h-[45px] w-full shrink-0 items-center bg-[#0D0D0F]"
			style={{ WebkitAppRegion: "drag" } as CSSProperties}
		>
			<Logo className="pointer-events-none absolute left-1/2 h-4 w-auto -translate-x-1/2 text-white" />
		</div>
	);
}
