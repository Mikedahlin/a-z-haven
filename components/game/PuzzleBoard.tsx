"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  applyGravity,
  BOARD_SIZE,
  clearMatches,
  createBoard,
  findMatches,
  swap,
  swapCreatesMatch,
  countMarks,
  type Board,
} from "@/lib/puzzle";
import { sounds, resumeAudioContext } from "@/lib/audio";
import { useGameStore } from "@/store/game-store";
import { PuzzleStoryInterstitial } from "@/components/game/PuzzleStoryInterstitial";

const palette = [
  "from-rose-200 to-rose-400",
  "from-sky-200 to-sky-400",
  "from-amber-200 to-amber-400",
  "from-emerald-200 to-emerald-400",
  "from-violet-200 to-violet-400",
];

function resolveBoard(start: Board): { board: Board; cleared: number } {
  let board = start;
  let cleared = 0;
  for (let i = 0; i < 80; i++) {
    const marks = findMatches(board);
    const c = countMarks(marks);
    if (c === 0) break;
    cleared += c;
    board = clearMatches(board, marks);
    board = applyGravity(board);
  }
  return { board, cleared };
}

export function PuzzleBoard() {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const grantRewards = useGameStore((s) => s.grantRewards);
  const recordPuzzleScore = useGameStore((s) => s.recordPuzzleScore);
  const setPetMood = useGameStore((s) => s.setPetMood);
  const bumpHappiness = useGameStore((s) => s.bumpHappiness);
  const puzzleLevel = useGameStore((s) => s.puzzleLevel);
  const puzzleStoryLastMilestone = useGameStore(
    (s) => s.puzzleStoryLastMilestone,
  );
  const markPuzzleStorySeen = useGameStore((s) => s.markPuzzleStorySeen);
  const petProfile = useGameStore((s) => s.petProfile);

  const [board, setBoard] = useState<Board>(() => createBoard());
  const [selected, setSelected] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [scorePulse, setScorePulse] = useState(0);
  const [boardGen, setBoardGen] = useState(0);

  const [storyOpen, setStoryOpen] = useState(false);
  const [storyMilestone, setStoryMilestone] = useState(10);

  useEffect(() => {
    if (puzzleLevel < 10) return;
    const tier = Math.floor(puzzleLevel / 10) * 10;
    if (puzzleStoryLastMilestone >= tier) return;
    setStoryMilestone(tier);
    setStoryOpen(true);
  }, [puzzleLevel, puzzleStoryLastMilestone]);

  const closeStory = useCallback(() => {
    markPuzzleStorySeen(storyMilestone);
    bumpHappiness(6);
    setStoryOpen(false);
  }, [markPuzzleStorySeen, bumpHappiness, storyMilestone]);

  const onCellTap = useCallback(
    async (x: number, y: number) => {
      await resumeAudioContext();
      if (!selected) {
        sounds.tap(soundEnabled);
        setSelected({ x, y });
        return;
      }
      if (selected.x === x && selected.y === y) {
        setSelected(null);
        return;
      }
      const dx = Math.abs(selected.x - x);
      const dy = Math.abs(selected.y - y);
      if (dx + dy !== 1) {
        sounds.tap(soundEnabled);
        setSelected({ x, y });
        return;
      }
      if (!swapCreatesMatch(board, selected.x, selected.y, x, y)) {
        sounds.tap(soundEnabled);
        setSelected(null);
        return;
      }
      const swapped = swap(board, selected.x, selected.y, x, y);
      const resolved = resolveBoard(swapped);
      setBoard(resolved.board);
      setMoves((m) => m + 1);
      const gained = resolved.cleared;
      const add = gained * 12;
      setScore((s) => {
        const next = s + add;
        recordPuzzleScore(next);
        return next;
      });
      setScorePulse((k) => k + 1);
      sounds.success(soundEnabled);
      if (gained >= 10) sounds.wag(soundEnabled);
      const coins = Math.max(1, Math.floor(gained / 3));
      const treats = Math.max(0, Math.floor(gained / 6));
      const bones = gained >= 8 ? 1 : 0;
      const decorTokens = gained >= 12 ? 1 : 0;
      const stars = gained >= 18 ? 1 : 0;
      grantRewards({ coins, treats, bones, decorTokens, stars });
      setPetMood(
        gained > 12 ? "excited" : gained > 6 ? "playful" : "happy",
      );
      if (gained >= 14) sounds.reward(soundEnabled);
      setSelected(null);
    },
    [
      board,
      selected,
      soundEnabled,
      grantRewards,
      recordPuzzleScore,
      setPetMood,
    ],
  );

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="flex items-center justify-between text-sm text-cozy-cocoa/80">
        <p>
          Level{" "}
          <span className="font-semibold tabular-nums">{puzzleLevel}</span>
        </p>
        <p>
          Moves: <span className="font-semibold tabular-nums">{moves}</span>
        </p>
      </div>
      <div className="flex items-center justify-between text-sm text-cozy-cocoa/80">
        <motion.p
          key={scorePulse}
          initial={reducedMotion ? false : { scale: 1 }}
          animate={reducedMotion ? {} : { scale: [1, 1.12, 1] }}
          transition={{ duration: 0.38 }}
        >
          Score: <span className="font-semibold tabular-nums">{score}</span>
        </motion.p>
        <p className="max-w-[55%] text-right text-xs text-cozy-cocoa/55">
          Every 10 levels, a tiny story of {petProfile.petName.trim() || "your pet"} unfolds.
        </p>
      </div>
      <motion.div
        key={boardGen}
        initial={reducedMotion ? false : { opacity: 0.85, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="grid aspect-square w-full gap-2 rounded-3xl bg-white/60 p-3 shadow-card"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        }}
      >
        {board.map((row, y) =>
          row.map((t, x) => {
            const active =
              selected && selected.x === x && selected.y === y ? true : false;
            return (
              <motion.button
                key={`${boardGen}-${x}-${y}`}
                type="button"
                aria-label={`Tile row ${y + 1} column ${x + 1}`}
                onClick={() => void onCellTap(x, y)}
                className={`relative aspect-square w-full overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br shadow-sm ${
                  palette[t] ?? palette[0]
                } ${active ? "ring-2 ring-cozy-honey ring-offset-2 ring-offset-white/40" : ""}`}
                whileHover={
                  reducedMotion
                    ? undefined
                    : { scale: 1.04, transition: { duration: 0.18 } }
                }
                whileTap={reducedMotion ? undefined : { scale: 0.92 }}
              >
                <span className="pointer-events-none absolute inset-0 bg-white/15" />
                <span className="pointer-events-none absolute bottom-1 right-1 text-[10px] font-semibold text-white/70">
                  {t + 1}
                </span>
              </motion.button>
            );
          }),
        )}
      </motion.div>
      <button
        type="button"
        onClick={() => {
          setBoard(createBoard());
          setSelected(null);
          setBoardGen((g) => g + 1);
          sounds.softChime(soundEnabled);
        }}
        className="w-full rounded-2xl border border-cozy-cocoa/10 bg-white/70 py-3 text-sm font-semibold text-cozy-cocoa shadow-sm transition hover:bg-white/90"
      >
        New board
      </button>

      <PuzzleStoryInterstitial
        open={storyOpen}
        milestone={storyMilestone}
        petName={petProfile.petName}
        petType={petProfile.petType}
        soundEnabled={soundEnabled}
        reducedMotion={reducedMotion}
        onClose={closeStory}
      />
    </div>
  );
}
