import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useHaven } from "@/lib/store";

const COLS = 18;
const ROWS = 14;
const TICK_MS = 130;

const DIRS = {
    ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
};

function newApple(snake) {
    while (true) {
        const a = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        if (!snake.some((s) => s.x === a.x && s.y === a.y)) return a;
    }
}

export default function Snake() {
    const { state, update, grantRewards } = useHaven();
    const [snake, setSnake] = useState([{ x: 5, y: 7 }]);
    const [dir, setDir] = useState({ x: 1, y: 0 });
    const [apple, setApple] = useState({ x: 12, y: 7 });
    const [score, setScore] = useState(0);
    const [running, setRunning] = useState(false);
    const [over, setOver] = useState(false);
    const dirRef = useRef(dir);
    dirRef.current = dir;

    useEffect(() => {
        const onKey = (e) => {
            const d = DIRS[e.key];
            if (!d) return;
            const cur = dirRef.current;
            if (cur.x + d.x === 0 && cur.y + d.y === 0) return;
            setDir(d);
            e.preventDefault();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const reset = () => {
        setSnake([{ x: 5, y: 7 }]); setDir({ x: 1, y: 0 }); setApple({ x: 12, y: 7 });
        setScore(0); setOver(false); setRunning(true);
    };

    const tick = useCallback(() => {
        setSnake((prev) => {
            const head = { x: prev[0].x + dirRef.current.x, y: prev[0].y + dirRef.current.y };
            if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || prev.some((s) => s.x === head.x && s.y === head.y)) {
                setRunning(false); setOver(true); return prev;
            }
            const ate = head.x === apple.x && head.y === apple.y;
            const next = [head, ...prev];
            if (!ate) next.pop(); else { setScore((s) => s + 10); setApple(newApple(next)); }
            return next;
        });
    }, [apple]);

    useEffect(() => {
        if (!running) return;
        const id = setInterval(tick, TICK_MS);
        return () => clearInterval(id);
    }, [running, tick]);

    useEffect(() => {
        if (!over) return;
        const stars = score >= 200 ? 3 : score >= 120 ? 2 : score >= 50 ? 1 : 0;
        const grants = { coins: Math.floor(score / 5), bones: Math.max(1, Math.floor(score / 50)), stars };
        grantRewards(grants);
        update({ snake_high_score: Math.max(state.snake_high_score, score) });
        toast.success(`*beep* nice round · +${grants.coins}◎ · +${stars}★`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [over]);

    const cellSize = 22;

    return (
        <div className="space-y-5" data-testid="snake-page">
            <header>
                <h1 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">BMO Snake</h1>
                <p className="text-ink2 mt-1">Arrow keys or WASD. <span className="font-semibold text-ink">High score: {state.snake_high_score}</span></p>
            </header>
            <div className="cozy-card p-5 sm:p-7 inline-block">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={reset} className="btn-primary" data-testid="snake-start">{over || !running ? "Start" : "Restart"}</button>
                    <span className="px-3 py-1 rounded-full bg-stone/70 text-sm">Score <b>{score}</b></span>
                    {over && <span className="px-3 py-1 rounded-full bg-terracotta/15 text-terracotta font-semibold text-sm" data-testid="snake-over">*beep* — round done</span>}
                </div>
                <div
                    className="relative bg-ink rounded-2xl overflow-hidden"
                    style={{ width: COLS * cellSize, height: ROWS * cellSize }}
                    data-testid="snake-canvas"
                >
                    <div
                        className="absolute rounded-sm"
                        style={{ left: apple.x * cellSize + 3, top: apple.y * cellSize + 3, width: cellSize - 6, height: cellSize - 6, background: "#D9735A", boxShadow: "0 0 12px rgba(217,115,90,0.55)" }}
                    />
                    {snake.map((s, i) => (
                        <div
                            key={i}
                            className="absolute rounded-md"
                            style={{ left: s.x * cellSize + 2, top: s.y * cellSize + 2, width: cellSize - 4, height: cellSize - 4, background: i === 0 ? "#7CA3B5" : "#5B7B53", boxShadow: i === 0 ? "0 0 0 2px #7CA3B5" : "none" }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
