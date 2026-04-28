import { motion } from "framer-motion";

const PALETTE = ["#D9735A", "#5B7B53", "#DDA752", "#7CA3B5", "#8E8B82"]; // terracotta, moss, ochre, sky, stone
const SHAPES = ["●", "◆", "▲", "■", "✿"]; // calm tile glyphs

const SIZE = 6;

function makeBoard() {
    const b = [];
    for (let r = 0; r < SIZE; r++) {
        const row = [];
        for (let c = 0; c < SIZE; c++) {
            row.push(Math.floor(Math.random() * PALETTE.length));
        }
        b.push(row);
    }
    // ensure no immediate triple matches at start
    for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++) {
            while (
                (c >= 2 && b[r][c] === b[r][c - 1] && b[r][c] === b[r][c - 2]) ||
                (r >= 2 && b[r][c] === b[r - 1][c] && b[r][c] === b[r - 2][c])
            ) {
                b[r][c] = (b[r][c] + 1) % PALETTE.length;
            }
        }
    return b;
}

function findMatches(board) {
    const marks = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE - 2; c++) {
            const v = board[r][c];
            if (v === board[r][c + 1] && v === board[r][c + 2]) {
                marks[r][c] = marks[r][c + 1] = marks[r][c + 2] = true;
            }
        }
    }
    for (let c = 0; c < SIZE; c++) {
        for (let r = 0; r < SIZE - 2; r++) {
            const v = board[r][c];
            if (v === board[r + 1][c] && v === board[r + 2][c]) {
                marks[r][c] = marks[r + 1][c] = marks[r + 2][c] = true;
            }
        }
    }
    let count = 0;
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (marks[r][c]) count++;
    return { marks, count };
}

function clearAndDrop(board, marks) {
    const next = board.map((r) => r.slice());
    for (let c = 0; c < SIZE; c++) {
        const stack = [];
        for (let r = SIZE - 1; r >= 0; r--) {
            if (!marks[r][c]) stack.push(next[r][c]);
        }
        for (let r = SIZE - 1; r >= 0; r--) {
            next[r][c] = stack.length ? stack.shift() : Math.floor(Math.random() * PALETTE.length);
        }
    }
    return next;
}

export default function PuzzleBoard({ onResult }) {
    const [board, setBoard] = React.useState(makeBoard);
    const [selected, setSelected] = React.useState(null);
    const [score, setScore] = React.useState(0);
    const [moves, setMoves] = React.useState(20);
    const [done, setDone] = React.useState(false);

    const handleTile = (r, c) => {
        if (done) return;
        if (!selected) { setSelected({ r, c }); return; }
        const dr = Math.abs(selected.r - r), dc = Math.abs(selected.c - c);
        if (dr + dc !== 1) { setSelected({ r, c }); return; }
        // swap
        const next = board.map((row) => row.slice());
        [next[selected.r][selected.c], next[r][c]] = [next[r][c], next[selected.r][selected.c]];
        const { count, marks } = findMatches(next);
        if (count === 0) { setSelected(null); return; }
        let working = next;
        let totalMatched = 0;
        let cascade = 0;
        let m = marks;
        while (true) {
            const cnt = m.flat().filter(Boolean).length;
            if (cnt === 0) break;
            totalMatched += cnt;
            cascade += 1;
            working = clearAndDrop(working, m);
            m = findMatches(working).marks;
        }
        const gained = totalMatched * 10 * (cascade > 1 ? cascade : 1);
        const nextScore = score + gained;
        const nextMoves = moves - 1;
        setBoard(working);
        setScore(nextScore);
        setMoves(nextMoves);
        setSelected(null);
        if (nextMoves <= 0) {
            setDone(true);
            onResult && onResult({ score: nextScore });
        }
    };

    const reset = () => {
        setBoard(makeBoard()); setScore(0); setMoves(20); setDone(false); setSelected(null);
    };

    return (
        <div className="cozy-card p-5 sm:p-6" data-testid="puzzle-board">
            <div className="flex items-center justify-between mb-4">
                <div className="font-heading text-2xl text-ink">A Calm Match</div>
                <div className="flex gap-3 text-sm font-body text-ink2">
                    <span data-testid="puzzle-score" className="px-3 py-1 rounded-full bg-stone/70">score <b className="text-ink">{score}</b></span>
                    <span data-testid="puzzle-moves" className="px-3 py-1 rounded-full bg-stone/70">moves <b className="text-ink">{moves}</b></span>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-2 sm:gap-3 max-w-md">
                {board.map((row, r) =>
                    row.map((v, c) => {
                        const sel = selected && selected.r === r && selected.c === c;
                        return (
                            <button
                                key={`${r}-${c}`}
                                onClick={() => handleTile(r, c)}
                                data-testid={`tile-${r}-${c}`}
                                className={`tile-piece aspect-square rounded-2xl flex items-center justify-center text-2xl font-bold ${sel ? "selected" : ""}`}
                                style={{ backgroundColor: PALETTE[v] + "26", color: PALETTE[v] }}
                            >
                                {SHAPES[v]}
                            </button>
                        );
                    })
                )}
            </div>
            <div className="mt-5 flex items-center gap-3">
                <button onClick={reset} className="btn-ghost" data-testid="puzzle-reset">New board</button>
                {done && <div className="text-moss font-semibold" data-testid="puzzle-done">A gentle round complete · rewards granted</div>}
            </div>
        </div>
    );
}

// React import for older config
import React from "react";
