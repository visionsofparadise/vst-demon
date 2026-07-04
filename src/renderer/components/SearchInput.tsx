import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import type { AppContext } from "../models/Context";

export function SearchInput({ context }: { readonly context: AppContext }) {
	const { query, setQuery } = context;

	const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setQuery(event.target.value);
	};

	return (
		<div className="relative flex-1">
			<Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6a6a72]" />
			<input
				type="text"
				value={query}
				onChange={onChange}
				aria-label="Filter plugins by name"
				placeholder="Search plugins…"
				className="h-8 w-full rounded-md border border-[#26262b] bg-[#161619] pl-9 pr-3 text-sm text-[#B8B8C0] outline-none placeholder:text-[#6a6a72] focus-visible:border-[#4a4a52]"
			/>
		</div>
	);
}
