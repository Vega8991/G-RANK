import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { createLobby, getAllLobbies, getMyLobbies, registerToLobby, leaveLobby, syncParticipantCounts } from "../services/lobbyService";
import { submitReplay } from "../services/matchService";
import { getProfile } from "../services/authService";
import type { Lobby, MatchResultResponse } from "../types";

type GameType = "pokemon_showdown" | "league_of_legends" | "valorant";

export interface CreateLobbyParams {
    name: string;
    description: string;
    maxParticipants: number;
    prizePool: string;
    registrationDeadline: string;
    matchDateTime: string;
    game: GameType;
}

function getErrorMessage(err: unknown): string {
    const axiosErr = err as AxiosError<{ message?: string }>;
    return axiosErr.response?.data?.message || "Error";
}

function hasLobbyId(value: unknown): value is Lobby {
    if (!value || typeof value !== "object") return false;
    const record = value as { _id?: unknown };
    return typeof record._id === "string" && record._id.length > 0;
}

export function useLobbies() {
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [myLobbies, setMyLobbies] = useState<Lobby[]>([]);
    const [userRiotLinked, setUserRiotLinked] = useState<boolean | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [result, setResult] = useState<MatchResultResponse | null>(null);

    useEffect(function () {
        getProfile()
            .then(function (res) { setUserRiotLinked(!!res.user.riotPuuid); })
            .catch(function () { setUserRiotLinked(null); });
    }, []);

    const loadData = useCallback(async function (options?: { shouldSync?: boolean }) {
        setSuccessMessage("");
        setErrorMessage("");
        const shouldSync = options?.shouldSync ?? false;
        if (shouldSync) {
            try { await syncParticipantCounts(); } catch { }
        }
        const [allLobbiesResult, myLobbiesResult] = await Promise.allSettled([getAllLobbies(), getMyLobbies()]);
        if (allLobbiesResult.status === "fulfilled") {
            setLobbies(Array.isArray(allLobbiesResult.value.lobbies) ? allLobbiesResult.value.lobbies.filter(hasLobbyId) : []);
        } else {
            setErrorMessage(getErrorMessage(allLobbiesResult.reason));
            setSuccessMessage("");
        }
        if (myLobbiesResult.status === "fulfilled") {
            setMyLobbies(Array.isArray(myLobbiesResult.value.lobbies) ? myLobbiesResult.value.lobbies.filter(hasLobbyId) : []);
        } else {
            setMyLobbies([]);
        }
    }, []);

    useEffect(function () { void loadData({ shouldSync: true }); }, [loadData]);

    const handleRegister = useCallback(async function (id: string) {
        try {
            await registerToLobby(id);
            setSuccessMessage("Successfully registered");
            setErrorMessage("");
            setTimeout(() => setSuccessMessage(""), 4000);
            void loadData();
        } catch (err) {
            setErrorMessage(getErrorMessage(err));
            setSuccessMessage("");
            setTimeout(() => setErrorMessage(""), 4000);
        }
    }, [loadData]);

    const handleLeave = useCallback(async function (id: string) {
        try {
            await leaveLobby(id);
            setSuccessMessage("Left lobby successfully");
            setErrorMessage("");
            setTimeout(() => setSuccessMessage(""), 4000);
            void loadData();
        } catch (err) {
            setErrorMessage(getErrorMessage(err));
            setSuccessMessage("");
            setTimeout(() => setErrorMessage(""), 4000);
        }
    }, [loadData]);

    async function handleCreate(params: CreateLobbyParams) {
        try {
            await createLobby(
                params.name,
                params.description,
                params.maxParticipants,
                params.prizePool,
                params.registrationDeadline,
                params.matchDateTime,
                params.game
            );
            setSuccessMessage("Lobby created successfully");
            setErrorMessage("");
            setTimeout(() => setSuccessMessage(""), 4000);
            void loadData({ shouldSync: true });
        } catch (err) {
            setErrorMessage(getErrorMessage(err));
            setSuccessMessage("");
            setTimeout(() => setErrorMessage(""), 4000);
            throw err;
        }
    }

    async function handleSubmitReplay(lobbyId: string, replayUrl: string) {
        try {
            const res = await submitReplay(lobbyId, replayUrl);
            setResult(res);
            setSuccessMessage("Replay submitted successfully");
            setErrorMessage("");
            setTimeout(() => setSuccessMessage(""), 4000);
            void loadData();
        } catch (err) {
            setErrorMessage(getErrorMessage(err));
            setSuccessMessage("");
            setTimeout(() => setErrorMessage(""), 4000);
            throw err;
        }
    }

    return {
        lobbies,
        myLobbies,
        userRiotLinked,
        successMessage,
        errorMessage,
        result,
        loadData,
        handleRegister,
        handleLeave,
        handleCreate,
        handleSubmitReplay,
    };
}
