---
id: overlay-1v1-screen
title: Overlay 1v1 Screen
sidebar_label: overlay-1v1-screen.tsx
---

Example overlay screen component with POV streams, `useMatchRoom`, and per-player audio wiring.

**Key additions over the bare example:**
- `audio` prop wired to each `PovStream` (muted/volume per player)
- `overlay:reload_stream` handled via `useMatchRoom`'s `onReloadStream` callback
- Live map score bar at the top

**Data flow:**
```
Overlay controller → overlay:set_active_match → server
server → overlay:active_match_changed → useOverlaySocket
useOverlaySocket → overlayState.activeMatchId + .audio → this component
this component → useMatchRoom → live TA scores → PovStream
```

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { initSocket } from "@h/use-socket";
import { useMatchRoom } from "@h/useMatchRoom";
import type { OverlayAudioState } from "@t/overlay";
import { PovStream } from "@c/ov/component/PovStream";

declare const process: { env: Record<string, string | undefined> };
const WEBRTC_BASE = process.env.NEXT_PUBLIC_WEBRTC_URL ?? "";

type Player = { id: string; username: string; avatarURL?: string };

type Props = {
  tournamentId: string;
  activeMatchId: string;   // from overlayState.activeMatchId in parent
  audio: OverlayAudioState; // from overlayState.audio in parent
};

export function Overlay1v1Screen({ tournamentId, activeMatchId, audio }: Props) {
  const socketRef = useRef(initSocket());

  const [players, setPlayers] = useState<Player[]>([]);
  const [playerSsIds, setPlayerSsIds] = useState<[string | null, string | null]>([null, null]);
  const [playerBlIds, setPlayerBlIds] = useState<[string | null, string | null]>([null, null]);
  const [streamReloadKeys, setStreamReloadKeys] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (!activeMatchId) return;
    fetch(`/api/tournaments/${tournamentId}/matches/${activeMatchId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setPlayers(data.matchData?.players ?? []);
        setPlayerSsIds(data.playerSsIds ?? [null, null]);
        setPlayerBlIds(data.playerBlIds ?? [null, null]);
      });
  }, [tournamentId, activeMatchId]);

  const { taUsers, realtimeScores, liveScore } = useMatchRoom(socketRef.current, {
    tournamentId,
    matchId: activeMatchId,
    onReloadStream: (player) => {
      setStreamReloadKeys((prev) => {
        const next: [number, number] = [...prev] as [number, number];
        if (player === 0 || player === "both") next[0]++;
        if (player === 1 || player === "both") next[1]++;
        return next;
      });
    },
  });

  // Resolve guid-keyed realtimeScores to playerId-keyed
  const liveScoresByPlayerId: Record<string, {
    score: number; accuracy: number; combo: number; notesMissed: number; badCuts: number;
  }> = {};

  for (const [guid, s] of Object.entries(realtimeScores)) {
    const taUser = taUsers[guid];
    if (!taUser) continue;
    const playerIdx = players.findIndex(
      (_, i) =>
        (playerSsIds[i] && taUser.platformId === playerSsIds[i]) ||
        (playerBlIds[i] && taUser.platformId === playerBlIds[i]),
    );
    if (playerIdx >= 0) {
      liveScoresByPlayerId[players[playerIdx].id] = {
        score: s.scoreWithModifiers,
        accuracy: s.accuracy,
        combo: s.combo,
        notesMissed: s.notesMissed,
        badCuts: s.badCuts,
      };
    }
  }

  if (!WEBRTC_BASE || players.length < 2) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-white/40 text-2xl">
          {!WEBRTC_BASE ? "WebRTC not configured" : "Loading players..."}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Map score bar - liveScore is [p0MapWins, p1MapWins] */}
      <div className="flex items-center justify-center gap-8 py-3 bg-black/60 border-b border-white/10 text-white">
        <span className="text-4xl font-bold">{liveScore[0]}</span>
        <span className="text-sm text-white/50 uppercase tracking-widest">Map Score</span>
        <span className="text-4xl font-bold">{liveScore[1]}</span>
      </div>

      {/* POV streams */}
      <div className="flex-1 grid grid-cols-2">
        {players.slice(0, 2).map((player, i) => (
          <PovStream
            key={`${player.id}-${streamReloadKeys[i]}`}
            src={`${WEBRTC_BASE}/${player.id}/`}
            title={`${player.username} POV`}
            rounded={i === 0 ? "left" : "right"}
            username={player.username}
            avatarURL={player.avatarURL}
            playerId={player.id}
            liveScore={liveScoresByPlayerId[player.id]}
            muted={i === 0 ? audio.player0Muted : audio.player1Muted}
            volume={i === 0 ? audio.player0Volume : audio.player1Volume}
          />
        ))}
      </div>
    </div>
  );
}
```

## Parent overlay page wiring

```tsx
// app/(overlay)/overlay/[tournamentId]/1v1/page.tsx
"use client";
import { useParams } from "next/navigation";
import { useOverlaySocket } from "@h/useOverlaySocket";
import { Overlay1v1Screen } from "@c/overlay/screens/Overlay1v1Screen";

export default function Overlay1v1Page() {
  const params = useParams();
  const tournamentId = params.tournamentId as string;

  const { overlayState } = useOverlaySocket({ mode: "view", tournamentId });

  if (!overlayState.activeMatchId) {
    return (
      <div className="fixed inset-0 flex items-center justify-center text-white/30">
        No active match
      </div>
    );
  }

  return (
    <Overlay1v1Screen
      tournamentId={tournamentId}
      activeMatchId={overlayState.activeMatchId}
      audio={overlayState.audio}
    />
  );
}
```
