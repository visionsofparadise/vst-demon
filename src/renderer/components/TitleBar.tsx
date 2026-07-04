import type { CSSProperties } from "react";

export function TitleBar() {
	return (
		<div
			className="relative flex h-[45px] w-full shrink-0 items-center bg-[#0D0D0F] pr-[138px]"
			style={{ WebkitAppRegion: "drag" } as CSSProperties}
		>
			<span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-sm font-bold leading-none tracking-tight text-[#B8B8C0]">
				VST DEMON
			</span>
		</div>
	);
}
