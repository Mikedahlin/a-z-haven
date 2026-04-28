import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, setToken, clearToken } from "./api";
import { INITIAL_STATE } from "./content";

const Ctx = createContext(null);

const LOCAL_KEY = "az-haven-save-v3";

function loadLocal() {
    try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (!raw) return null;
        const obj = JSON.parse(raw);
        return { ...INITIAL_STATE, ...obj };
    } catch {
        return null;
    }
}

function saveLocal(state) {
    try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
    } catch {}
}

export function HavenProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [state, setState] = useState(() => loadLocal() || INITIAL_STATE);

    const refreshMe = useCallback(async () => {
        if (!getToken()) {
            setAuthLoading(false);
            return;
        }
        try {
            const res = await api.get("/auth/me");
            setUser(res.data.user);
            // hydrate server state if no local
            if (!loadLocal()) {
                try {
                    const sres = await api.get("/gamestate");
                    if (sres.data.state) {
                        setState({ ...INITIAL_STATE, ...sres.data.state });
                    }
                } catch {}
            }
        } catch {
            clearToken();
            setUser(null);
        } finally {
            setAuthLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshMe();
    }, [refreshMe]);

    useEffect(() => {
        saveLocal(state);
    }, [state]);

    // Debounced server sync
    useEffect(() => {
        if (!user) return;
        const t = setTimeout(() => {
            api.post("/gamestate", { state }).catch(() => {});
        }, 1500);
        return () => clearTimeout(t);
    }, [state, user]);

    const signInWithGoogleCredential = async (credential) => {
        const res = await api.post("/auth/google", { credential });
        setToken(res.data.token);
        setUser(res.data.user);
        // Hydrate state
        try {
            const sres = await api.get("/gamestate");
            if (sres.data.state) setState({ ...INITIAL_STATE, ...sres.data.state });
        } catch {}
    };

    const signOut = async () => {
        try { await api.post("/auth/logout"); } catch {}
        clearToken();
        setUser(null);
    };

    const update = (updater) => setState((s) => (typeof updater === "function" ? updater(s) : { ...s, ...updater }));

    const grantRewards = (g = {}) => {
        update((s) => ({
            ...s,
            coins: s.coins + (g.coins || 0),
            treats: s.treats + (g.treats || 0),
            bones: s.bones + (g.bones || 0),
            decor_tokens: s.decor_tokens + (g.decor_tokens || 0),
            stars: s.stars + (g.stars || 0),
        }));
    };

    const setPetProfile = (profile) => {
        update((s) => ({ ...s, pet_profile: { ...s.pet_profile, ...profile } }));
        if (user) api.post("/pet", { ...state.pet_profile, ...profile }).catch(() => {});
    };

    const unlockRoom = (id) => {
        const room = require("./content").ROOMS.find((r) => r.id === id);
        if (!room) return false;
        if (state.unlocked_rooms.includes(id)) return true;
        if (state.coins < room.unlock.coins || state.stars < room.unlock.stars) return false;
        update((s) => ({
            ...s,
            coins: s.coins - room.unlock.coins,
            unlocked_rooms: [...s.unlocked_rooms, id],
        }));
        return true;
    };

    const buyDecor = (id) => {
        const item = require("./content").DECOR.find((d) => d.id === id);
        if (!item) return false;
        if (state.owned_decor_ids.includes(id)) return false;
        if (state.decor_tokens < item.cost) return false;
        update((s) => ({
            ...s,
            decor_tokens: s.decor_tokens - item.cost,
            owned_decor_ids: [...s.owned_decor_ids, id],
        }));
        return true;
    };

    const placeDecor = (roomId, decorId) => {
        update((s) => ({ ...s, placed_decor: { ...s.placed_decor, [roomId]: decorId } }));
    };

    const setSelectedRoom = (id) => update({ selected_room: id });

    const adjustStat = (key, delta) => update((s) => {
        const next = Math.max(0, Math.min(100, (s.pet[key] || 0) + delta));
        return { ...s, pet: { ...s.pet, [key]: next } };
    });

    const resetSave = () => {
        localStorage.removeItem(LOCAL_KEY);
        setState(INITIAL_STATE);
        if (user) api.post("/gamestate", { state: INITIAL_STATE }).catch(() => {});
    };

    return (
        <Ctx.Provider
            value={{
                user, authLoading, signInWithGoogleCredential, signOut,
                state, update, grantRewards, setPetProfile,
                unlockRoom, buyDecor, placeDecor, setSelectedRoom, adjustStat, resetSave,
            }}
        >
            {children}
        </Ctx.Provider>
    );
}

export function useHaven() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useHaven must be used inside <HavenProvider>");
    return ctx;
}
