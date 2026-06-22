"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/share/hooks/useAuth";
import { AuthPanel } from "@/share/components/auth-panel";
import { NotificationCenter } from "@/share/components/notification-center";
import { useNotifications } from "@/share/contexts/notificationContext";

type Mode = "login" | "register";

export function Navbar() {
	const { user, isAuthenticated, isLoading, logout } = useAuth();
	const { unreadCount } = useNotifications();
	const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
	const [authMode, setAuthMode] = useState<Mode>("login");
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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

	const toggleNotifications = () => {
		setIsNotificationOpen((current) => !current);
	};

	const closeNotifications = () => {
		setIsNotificationOpen(false);
	};

	return (
		<section className="sticky top-0 z-50 py-2 sm:py-3">
			<div className="grid grid-cols-[auto_1fr_auto] items-center justify-between gap-4 rounded-2xl border border-sky-200/10 bg-slate-900/60 backdrop-blur-xl px-4 py-2 sm:px-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
				<Link href="/" className="flex items-center gap-3 transition hover:opacity-80">
					<Image
						src="/assests/images/logo.png"
						alt="TypeMetric logo"
						width={40}
						height={40}
						className="h-8 w-8 sm:h-9 sm:w-9"
						priority
					/>
					<h1 className="text-xl font-black tracking-tight text-white sm:text-2xl drop-shadow-md">
						TypeMetric
					</h1>
				</Link>

				<div className="hidden sm:flex items-center justify-center gap-2">
					<Link
						href="/typing-test"
						className="rounded-lg border border-cyan-300/35 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
					>
						Typing Test
					</Link>
					<Link
						href="/multiplayer"
						className="rounded-lg border border-cyan-300/35 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
					>
						Multiplayer
					</Link>
					<Link
						href="/leaderboard"
						className="rounded-lg border border-cyan-300/35 bg-slate-900/40 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-slate-800"
					>
						Leaderboard
					</Link>
					<Link
						href="/about"
						className="rounded-lg border border-cyan-300/35 bg-slate-900/40 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-slate-800"
					>
						About
					</Link>
				</div>

				{/* Desktop Actions */}
				<div className="hidden sm:flex items-center justify-end gap-2">
					{isLoading ? (
						<span className="rounded-lg border border-white/10 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-300">
							Checking session...
						</span>
					) : isAuthenticated && user ? (
						<>
							<div className="relative">
								<button
									type="button"
									onClick={toggleNotifications}
									className="relative rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2 text-slate-100 transition hover:bg-slate-800"
									aria-label="Open notifications"
								>
									<svg
										aria-hidden="true"
										viewBox="0 0 24 24"
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
										<path d="M9 17a3 3 0 0 0 6 0" />
									</svg>
									{unreadCount > 0 ? (
										<span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-cyan-400 px-1.5 py-0.5 text-[10px] font-bold text-slate-950">
											{unreadCount > 9 ? "9+" : unreadCount}
										</span>
									) : null}
								</button>
								<NotificationCenter
									isOpen={isNotificationOpen}
									onClose={closeNotifications}
								/>
							</div>
							<Link
								href="/profile"
								className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
							>
								{user.name}
							</Link>
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

				<div className="sm:hidden flex flex-col gap-1.5 cursor-pointer justify-self-end">
					<button
						type="button"
						onClick={toggleNotifications}
						className="relative rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2 text-slate-100 transition hover:bg-slate-800"
						aria-label="Open notifications"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							className="h-4 w-4"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
							<path d="M9 17a3 3 0 0 0 6 0" />
						</svg>
						{unreadCount > 0 ? (
							<span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-cyan-400 px-1.5 py-0.5 text-[10px] font-bold text-slate-950">
								{unreadCount > 9 ? "9+" : unreadCount}
							</span>
						) : null}
					</button>
					<NotificationCenter
						isOpen={isNotificationOpen}
						onClose={closeNotifications}
					/>
				</div>

				{/* Mobile Hamburger Menu Button */}
				<button
					type="button"
					onClick={toggleMobileMenu}
					className="sm:hidden flex flex-col gap-1.5 cursor-pointer justify-self-end"
					aria-label="Toggle menu"
				>
					<span className={`w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
					<span className={`w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "opacity-0" : ""}`}></span>
					<span className={`w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
				</button>
			</div>

			{/* Mobile Menu */}
			{isMobileMenuOpen && (
				<div className="sm:hidden mt-2 rounded-2xl border border-sky-200/20 bg-slate-900/90 backdrop-blur-xl px-4 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
					<div className="space-y-3 flex flex-col">
						<Link
							href="/typing-test"
							onClick={closeMobileMenu}
							className="block rounded-lg border border-cyan-300/35 px-3 py-1.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
						>
							Typing Test
						</Link>
						<Link
							href="/multiplayer"
							onClick={closeMobileMenu}
							className="block rounded-lg border border-cyan-300/35 px-3 py-1.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
						>
							Multiplayer
						</Link>
						<Link
							href="/leaderboard"
							onClick={closeMobileMenu}
							className="block rounded-lg border border-cyan-300/35 bg-slate-900/40 px-3 py-1.5 text-sm font-semibold text-cyan-100 transition hover:bg-slate-800"
						>
							Leaderboard
						</Link>
						<Link
							href="/about"
							onClick={closeMobileMenu}
							className="block rounded-lg border border-cyan-300/35 bg-slate-900/40 px-3 py-1.5 text-sm font-semibold text-cyan-100 transition hover:bg-slate-800"
						>
							About
						</Link>


						<div className="h-px bg-white/10 my-1" />

						{isAuthenticated && user ? (
							<div className="flex items-center justify-between gap-2">
								<Link
									href="/profile"
									onClick={closeMobileMenu}
									className="flex-1 text-center block rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-3 py-1.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
								>
									{user.name}
								</Link>
								<button
									type="button"
									onClick={() => {
										logout();
										closeMobileMenu();
									}}
									className="flex-1 rounded-lg border border-emerald-200/30 bg-slate-900/40 px-3 py-1.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20 cursor-pointer"
								>
									Logout
								</button>
							</div>
						) : (
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => {
										openAuthModal("login");
										closeMobileMenu();
									}}
									className="flex-1 rounded-lg border border-white/15 bg-slate-900/50 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 cursor-pointer"
								>
									Login
								</button>
								<button
									type="button"
									onClick={() => {
										openAuthModal("register");
										closeMobileMenu();
									}}
									className="flex-1 rounded-lg bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 cursor-pointer"
								>
									Sign up
								</button>
							</div>
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
