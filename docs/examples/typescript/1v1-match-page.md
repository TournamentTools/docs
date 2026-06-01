---
id: 1v1-match-page
title: 1v1 Match Page
sidebar_label: 1v1-match-page.tsx
---

Example Next.js client component for a live 1v1 match page.

- Fetches match data on mount
- `useMatchRoom` handles room join/leave, all TA events, and reconnect
- Resolves guid-keyed `realtimeScores` to `playerId`-keyed via `taUsers.platformId` lookup
- Shows a sticky live score banner while the match is active

```tsx
"use client";

import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@h/useAuth";
import { useMatchRoom } from "@h/useMatchRoom";
import type { Match, MatchPlayerData } from "@t/matches";
import { Avatar, AvatarFallback, AvatarImage } from "@c/ui/avatar";
import { Button } from "@c/ui/button";

type MatchWithPlatformIds = Match & {
  taMatchGuid: string | null;
  playerSsIds: [string | null, string | null];
  playerBlIds: [string | null, string | null];
};

type DisplayScore = {
  score: number;
  accuracy: number;
  combo: number;
  notesMissed: number;
  badCuts: number;
};

export default function Example1v1Page({
  tournamentId,
  matchId,
}: {
  tournamentId: string;
  matchId: string;
}) {
  const { socket } = useAuth();
  const [match, setMatch] = useState<MatchWithPlatformIds | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tournaments/${tournamentId}/matches/${matchId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setMatch(data); })
      .finally(() => setLoading(false));
  }, [tournamentId, matchId]);

  const {
    taUsers,
    realtimeScores,
    liveScore,
    liveState,
    liveWinner,
    livePickBans,
    livePlayData,
    lastSongResults,
  } = useMatchRoom(socket, {
    tournamentId,
    matchId,
    initialScore: match?.matchData.score,
    initialState: match?.state,
    initialWinner: match?.matchData.winner,
    initialPickBans: match?.matchData.pickBansDatas,
    initialPlayData: match?.matchData.playData,
  });

  // Resolve guid-keyed realtimeScores to playerId-keyed
  // guid -> taUsers[guid].platformId -> playerSsIds/playerBlIds -> player.id
  const players: MatchPlayerData[] = match?.matchData.players ?? [];
  const ssIds = match?.playerSsIds ?? [null, null];
  const blIds = match?.playerBlIds ?? [null, null];
  const liveScoresByPlayerId: Record<string, DisplayScore> = {};

  for (const [guid, score] of Object.entries(realtimeScores)) {
    const taUser = taUsers[guid];
    if (!taUser) continue;
    const playerIdx = players.findIndex(
      (_, i) =>
        (ssIds[i] && taUser.platformId === ssIds[i]) ||
        (blIds[i] && taUser.platformId === blIds[i]),
    );
    if (playerIdx >= 0) {
      liveScoresByPlayerId[players[playerIdx].id] = {
        score: score.scoreWithModifiers,
        accuracy: score.accuracy,
        combo: score.combo,
        notesMissed: score.notesMissed,
        badCuts: score.badCuts,
      };
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Match not found</h1>
        <Link href={`/tournaments/${tournamentId}`}>
          <Button variant="outline">Back to tournament</Button>
        </Link>
      </div>
    );
  }

  const isLive = liveState === "live";
  const hasLiveScores = Object.keys(liveScoresByPlayerId).length > 0;

  const displayMatch: Match = {
    ...match,
    state: liveState as Match["state"],
    matchData: {
      ...match.matchData,
      score: liveScore,
      winner: liveWinner,
      pickBansDatas: livePickBans,
      playData: livePlayData,
    },
  };

  return (
    <div className="relative">
      {/* Sticky live score banner */}
      {isLive && hasLiveScores && (
        <div className="sticky top-0 z-30 border-b border-red-500/30 bg-background/90 backdrop-blur-md">
          <div className="container mx-auto px-4 max-w-7xl py-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 shrink-0">
                Live
              </span>
              <div className="flex-1 grid grid-cols-2 gap-3">
                {players.map((player) => {
                  const s = liveScoresByPlayerId[player.id];
                  return (
                    <div key={player.id} className="flex items-center gap-2 min-w-0">
                      <Avatar className="w-6 h-6 shrink-0">
                        <AvatarImage src={player.avatarURL} alt={player.username} />
                        <AvatarFallback className="text-xs">
                          {player.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium truncate">{player.username}</span>
                      {s ? (
                        <div className="ml-auto flex items-baseline gap-2 shrink-0">
                          <span className="text-sm font-extrabold font-mono text-primary">
                            {s.score.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {(s.accuracy * 100).toFixed(2)}%
                          </span>
                          <span className="text-xs text-muted-foreground">x{s.combo}</span>
                          {s.notesMissed > 0 && (
                            <span className="text-xs text-red-400">{s.notesMissed}m</span>
                          )}
                          {s.badCuts > 0 && (
                            <span className="text-xs text-yellow-400">{s.badCuts}bc</span>
                          )}
                        </div>
                      ) : (
                        <span className="ml-auto text-xs text-muted-foreground">Waiting...</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <Link
          href={`/tournaments/${tournamentId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to tournament
        </Link>

        {/* Score summary */}
        <div className="flex items-center justify-between rounded-lg border bg-card p-6">
          {players.map((player, i) => {
            const s = liveScoresByPlayerId[player.id];
            const matchScore = displayMatch.matchData.score[i];
            return (
              <div
                key={player.id}
                className={`flex flex-col items-center gap-2 ${i === 1 ? "items-end" : ""}`}
              >
                <Avatar className="w-16 h-16">
                  <AvatarImage src={player.avatarURL} alt={player.username} />
                  <AvatarFallback>{player.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{player.username}</span>
                <span className="text-3xl font-bold">{matchScore}</span>
                {isLive && (
                  <div className="text-center text-sm text-muted-foreground">
                    {s ? (
                      <>
                        <div className="font-mono text-primary font-bold">{s.score.toLocaleString()}</div>
                        <div>{(s.accuracy * 100).toFixed(2)}%</div>
                        <div>x{s.combo}</div>
                      </>
                    ) : (
                      <span>Not in game</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div className="text-2xl font-bold text-muted-foreground">VS</div>
        </div>

        {/* Last song results */}
        {lastSongResults.length > 0 && (
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Last Song Results
            </h3>
            {lastSongResults.slice(0, 5).map((result, i) => (
              <div key={i} className="text-sm flex items-center gap-2">
                <span className="text-muted-foreground truncate">{result.player?.name ?? "Unknown"}</span>
                <span className="font-mono ml-auto">{result.score.toLocaleString()}</span>
                {result.misses > 0 && <span className="text-xs text-red-400">{result.misses}m</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```
