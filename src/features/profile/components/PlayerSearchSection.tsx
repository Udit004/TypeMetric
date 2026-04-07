import { SearchUserResult } from "../types";

interface PlayerSearchSectionProps {
  query: string;
  results: SearchUserResult[];
  setQuery: (value: string) => void;
  onSearch: () => void;
  onAddFriend: (targetUserId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onDeleteRequest: (requestId: string) => void;
}

export function PlayerSearchSection({
  query,
  results,
  setQuery,
  onSearch,
  onAddFriend,
  onAcceptRequest,
  onDeleteRequest,
}: PlayerSearchSectionProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
      <div>
        <h2 className="text-lg font-bold text-white">Find Players</h2>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
          className="flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
        />
        <button
          type="button"
          onClick={onSearch}
          className="cursor-pointer rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
        >
          Search
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {results.map((result) => (
          <div key={result.id} className="rounded-2xl border border-white/8 bg-white/3 p-3">
            <p className="font-semibold text-white">{result.name}</p>
            <p className="mt-1 text-xs text-slate-400">{result.tagline || result.email}</p>
            <div className="mt-3">
              {result.relationshipStatus === "none" ? (
                <button
                  type="button"
                  onClick={() => onAddFriend(result.id)}
                  className="cursor-pointer rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Add Friend
                </button>
              ) : result.relationshipStatus === "friends" ? (
                <span className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100">
                  Friends
                </span>
              ) : result.relationshipStatus === "outgoing_request" ? (
                <span className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300">
                  Pending
                </span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => result.requestId && onAcceptRequest(result.requestId)}
                    className="cursor-pointer rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => result.requestId && onDeleteRequest(result.requestId)}
                    className="cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {query.trim().length >= 2 && results.length === 0 ? (
          <p className="text-sm text-slate-400">No users found.</p>
        ) : null}
      </div>
    </section>
  );
}
