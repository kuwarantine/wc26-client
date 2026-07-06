import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { API_URL } from "./lib/Constants";

export interface MatchEvent {
    time: number,
    extra_time: number,
    player: string,
    assist: string,
    type: string,
    detail: string
}

export interface MatchData {
    date: number,
    status: string,
    number: number,
    round: number,
    elapsed: number | null,
    extra: number | null,
    winnerID: number | null,
    homeID: number | null,
    awayID: number | null,
    homeScore: number,
    awayScore: number,
    homeET: number | null,
    awayET: number | null,
    homePen: number | null,
    awayPen: number | null,
    homeEvents: MatchEvent[],
    awayEvents: MatchEvent[]
}

const LiveMatchContext = createContext<MatchData | null>(null);

export function LiveMatchProvider({children}: {children: ReactNode}) {
    const [match, setMatch] = useState<MatchData | null>(null);

    useEffect(() => {
        let timerId: ReturnType<typeof setTimeout> | null = null;
        let source: EventSource | null = null;

        const connect = () => {
            source = new EventSource(API_URL+'/latest');

            const handleUpdate = (event: MessageEvent) => {
                try {
                    const payload = JSON.parse(event.data);
                    setMatch(payload.matchData);
                } catch (err) {
                    console.error(err);
                }
            };

            const handleDowntime = (event: MessageEvent) => {
                const payload = JSON.parse(event.data);
                setMatch(null);
                cleanup();

                if (payload.timeToNext) {
                    timerId = setTimeout(connect, payload.timeToNext);
                }
            };

            const cleanup = () => {
                if (source) {
                    source.removeEventListener('match-update', handleUpdate);
                    source.removeEventListener('match-end', handleDowntime);
                    source.removeEventListener('not-live', handleDowntime);
                    source.close();
                    source = null;
                }
            };
        

            source.addEventListener('match-update', handleUpdate);
            source.addEventListener('match-end', handleDowntime);
            source.addEventListener('not-live', handleDowntime);

            source.onerror = () => {
                cleanup();
                timerId = setTimeout(connect, 10000);
            };
        };

        connect();

        return () => {
            if (timerId) clearTimeout(timerId);
            if (source) source.close();
        };

    }, []);

    return (
        <LiveMatchContext.Provider value={match}>
            {children}
        </LiveMatchContext.Provider>
    );
}

export const useLiveMatch = () => useContext(LiveMatchContext);