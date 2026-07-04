import { RefreshCw } from "lucide-react";
import type { CSSProperties } from "react";
import type { AppContext } from "../models/Context";
import { cn } from "../utilities/cn";

export function TitleBar({ context }: { readonly context: AppContext }) {
	const { scanning, rescan } = context;

	return (
		<div
			className="relative flex h-[45px] w-full shrink-0 items-center bg-[#0D0D0F] pl-3 pr-[138px]"
			style={{ WebkitAppRegion: "drag" } as CSSProperties}
		>
			<span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-sm font-bold leading-none tracking-tight text-[#B8B8C0]">
				VST DEMON
			</span>

			<button
				type="button"
				onClick={rescan}
				disabled={scanning}
				aria-label={scanning ? "Rescanning plugins" : "Rescan plugins"}
				title="Rescan plugins"
				style={{ WebkitAppRegion: "no-drag" } as CSSProperties}
				className="ml-auto flex size-7 items-center justify-center rounded-md text-[#B8B8C0] outline-none hover:bg-[#1b1b1f] focus-visible:ring-1 focus-visible:ring-[#4a4a52] disabled:opacity-50"
			>
				<RefreshCw aria-hidden="true" className={cn("size-4", scanning && "animate-spin")} />
			</button>
		</div>
	);
}
