import { TitleBar } from "./components/TitleBar";

export function App() {
	return (
		<div className="flex h-screen w-screen flex-col bg-[#0D0D0F] text-[#B8B8C0]">
			<TitleBar />
			<div className="flex flex-1 items-center justify-center">
				<span className="select-none text-lg font-semibold tracking-tight">VST Demon</span>
			</div>
		</div>
	);
}
