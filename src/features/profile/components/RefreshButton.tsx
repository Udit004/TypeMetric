interface RefreshButtonProps {
  onClick: () => void;
  isRefreshing?: boolean;
  label?: string;
}

export function RefreshButton({
  onClick,
  isRefreshing = false,
  label = "Refresh section",
}: RefreshButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={isRefreshing}
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/12 bg-white/5 text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg
        className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 12A8 8 0 1 1 17.66 6.34"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M20 4V8H16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
