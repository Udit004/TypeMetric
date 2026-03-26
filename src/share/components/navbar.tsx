"use client";

import { useState } from "react";
import Image from "next/image";

import { useAuth } from "@/share/hooks/useAuth";
import { AuthPanel } from "@/share/components/auth-panel";

type Mode = "login" | "register";

export function Navbar() {
	const { user, isAuthenticated, isLoading, logout } = useAuth();
	const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
	const [authMode, setAuthMode] = useState<Mode>("login");

	const openAuthModal = (mode: Mode) => {
		setAuthMode(mode);
		setIsAuthModalOpen(true);
	};

	return (
		<section className="mb-8 lg:mb-10">
			<div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sky-200/20 bg-slate-900/35 px-4 py-3 backdrop-blur-sm sm:px-5">
				<div className="flex items-center gap-3 sm:gap-4">
					<Image
						src="/assests/images/logo.png"
						alt="TypeMetric logo"
						width={64}
						height={64}
						className="h-10 w-10 sm:h-12 sm:w-12"
						priority
					/>
					<h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
						TypeMetric
					</h1>
				</div>

				<div className="flex items-center gap-2">
					{isLoading ? (
						<span className="rounded-lg border border-white/10 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-300">
							Checking session...
						</span>
					) : isAuthenticated && user ? (
						<>
							<span className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
								{user.name}
							</span>
							<button
								type="button"
								onClick={logout}
								className="rounded-lg border border-emerald-200/30 bg-slate-900/40 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-300/20 cursor-pointer"
							>
								Logout
							</button>
						</>
					) : (
						<>
							<button
								type="button"
								onClick={() => openAuthModal("login")}
								className="rounded-lg border border-white/15 bg-slate-900/50 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 cursor-pointer"
							>
								Login
							</button>
							<button
								type="button"
								onClick={() => openAuthModal("register")}
								className="rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 cursor-pointer"
							>
								Sign up
							</button>
						</>
					)}
				</div>
			</div>

			<AuthPanel
				isOpen={isAuthModalOpen}
				onClose={() => setIsAuthModalOpen(false)}
				initialMode={authMode}
			/>
		</section>
	);
}
