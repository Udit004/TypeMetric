import Image from "next/image";

export function Navbar() {
	return (
		<section className="mb-8 flex flex-col gap-5 lg:mb-10">
			<span className="inline-flex w-fit items-center rounded-full border border-cyan-300/35 bg-cyan-100/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
				Pro Typing Platform
			</span>

			<div className="space-y-3">
				<div className="flex items-center gap-3 sm:gap-4">
					<Image
						src="/assests/images/logo.png"
						alt="TypeMetric logo"
						width={64}
						height={64}
						className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
						priority
					/>
					<h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
						TypeMetric
					</h1>
				</div>
				<p className="max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base lg:text-lg">
					Build elite typing speed with a distraction-free engine, precise WPM tracking,
					and instant accuracy insights designed for serious performance training.
				</p>
			</div>

			<div className="grid gap-3 text-xs text-slate-200 sm:grid-cols-3 sm:text-sm">
				<div className="rounded-2xl border border-sky-200/20 bg-slate-900/45 px-4 py-3 backdrop-blur-sm">
					Real-time feedback loop
				</div>
				<div className="rounded-2xl border border-sky-200/20 bg-slate-900/45 px-4 py-3 backdrop-blur-sm">
					Session-grade analytics
				</div>
				<div className="rounded-2xl border border-sky-200/20 bg-slate-900/45 px-4 py-3 backdrop-blur-sm">
					Clean keyboard-first workflow
				</div>
			</div>
		</section>
	);
}
