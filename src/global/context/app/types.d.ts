import Database from "@tauri-apps/plugin-sql";

export type AppMode = "pomodoro" | "focus" | "pause";
export type AppClockMode = "start" | "refresh" | "stop";

export type ContextType = {
    isWindowFocused: boolean;
    tasks: Task[];
    mode: AppMode;
    setMode: (mode: AppMode) => void;
    clockState: AppClockMode;
    setClockState: (state: AppClockMode) => void;
    openCreateTaskWindow: boolean;
    setOpenCreateTaskWindow: (state: boolean) => void;
    dbConnection: Database | undefined;
    setTasks: (list: Task[]) => void;
    clock: string;
    setClock: (clock: string) => void;
};
