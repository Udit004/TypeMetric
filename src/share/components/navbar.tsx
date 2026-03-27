"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/share/hooks/useAuth";
import { AuthPanel } from "@/share/components/auth-panel";

type Mode = "login" | "register";

export function Navbar() {
	const { user, isAuthenticated, isLoading, logout } = useAuth();
	const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
	const [authMode, setAuthMode] = useState<Mode>("login");
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const openAuthModal = (mode: Mode) => {
		setAuthMode(mode);
		setIsAuthModalOpen(true);
	};

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<section className="mb-1">
			<div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sky-200/20 bg-transparent px-4 py-3 backdrop-blur-sm sm:px-5">
				<Link href="/" className="flex items-center gap-3 sm:gap-4 transition hover:opacity-80">
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
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden sm:flex items-center gap-2">
					{isLoading ? (
						<span className="rounded-lg border border-white/10 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-300">
							Checking session...
						</span>
					) : isAuthenticated && user ? (
						<>
							<Link
								href="/multiplayer"
								className="rounded-lg border border-cyan-300/35 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
							>
								Multiplayer
							</Link>
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

				{/* Mobile Hamburger Menu Button */}
				<button
					type="button"
					onClick={toggleMobileMenu}
					className="sm:hidden flex flex-col gap-1.5 cursor-pointer"
					aria-label="Toggle menu"
				>
					<span className={`w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
					<span className={`w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "opacity-0" : ""}`}></span>
					<span className={`w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
				</button>
			</div>

			{/* Mobile Menu */}
			{isMobileMenuOpen && (
				<div className="sm:hidden mt-2 rounded-2xl border border-sky-200/20 bg-transparent backdrop-blur-sm px-4 py-3">
					<div className="space-y-3">
						{isLoading ? (
							<span className="block rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2 text-xs text-slate-300">
								Checking session...
							</span>
						) : isAuthenticated && user ? (
							<>
								<Link
									href="/multiplayer"
									onClick={closeMobileMenu}
									className="block rounded-lg border border-cyan-300/35 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20 text-center"
								>
									Multiplayer
								</Link>
								<div className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100 text-center">
									{user.name}
								</div>
								<button
									type="button"
									onClick={() => {
										logout();
										closeMobileMenu();
									}}
									className="w-full rounded-lg border border-emerald-200/30 bg-slate-900/40 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-300/20 cursor-pointer"
								>
									Logout
								</button>
							</>
						) : (
							<>
								<button
									type="button"
									onClick={() => {
										openAuthModal("login");
										closeMobileMenu();
									}}
									className="w-full rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 cursor-pointer"
								>
									Login
								</button>
								<button
									type="button"
									onClick={() => {
										openAuthModal("register");
										closeMobileMenu();
									}}
									className="w-full rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 cursor-pointer"
								>
									Sign up
								</button>
							</>
						)}
					</div>
				</div>
			)}

			<AuthPanel
				isOpen={isAuthModalOpen}
				onClose={() => setIsAuthModalOpen(false)}
				initialMode={authMode}
			/>
		</section>
	);
}
