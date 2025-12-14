import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ComponentProps } from "@src/shared/@types/component-props";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { UnlistenFn } from "@tauri-apps/api/event";
import { Task } from "@src/shared/@types/task";
import Database from '@tauri-apps/plugin-sql';
import { getTasks } from "@src/services/repository/tasks";
import * as console from "@tauri-apps/plugin-log";
import { TIMER_CLOCK_STRING, DEFAULT_MODE } from "@src/constants";
import { AppClockMode, AppMode, ContextType } from "./types";

const Context = createContext<ContextType | undefined>(undefined);

export const AppProvider = ({ children }: ComponentProps) => {
    const [tasks, handleTasks] = useState<Task[]>([]);
    const [clock, handleClock] = useState<string>(TIMER_CLOCK_STRING);
    const [mode, handleMode] = useState<AppMode>(DEFAULT_MODE);
    const [clockState, handleClockState] = useState<AppClockMode>("stop");
    const [isWindowFocused, setIsWindowFocused] = useState<boolean>(false);
    const [openCreateTaskWindow, handleOpenCreateTaskWindow] = useState<boolean>(false);
    const dbConnection = useRef<Database | undefined>(undefined);
    const tasksRef = useRef<Task[]>([]);

    // Handlers
    const setMode = (newMode: AppMode) => {
        handleMode(newMode);
    };

    const setClockState = (state: AppClockMode) => {
        handleClockState(state);
    };

    const setOpenCreateTaskWindow = (open: boolean) => {
        handleOpenCreateTaskWindow(open);
    };

    const getDatabaseInstance = async () => {
        try {
            const connection = await Database.load("sqlite:my-time-database.db");
            dbConnection.current = connection;
            return connection;
        } catch (error: any) {
            await console.error(error?.message || "Error to connect to database");
            return undefined;
        }
    };

    const setTasks = (list: Task[]) => {
        handleTasks(list);
        tasksRef.current = list;
    };

    const setClock = (clockTime: string) => {
        handleClock(clockTime);
    };

    // Effect para sincronizar tasks com tasksRef
    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);

    // Effect para resetar o timer quando mudar de modo MANUALMENTE
    useEffect(() => {
        if (mode !== "pomodoro") {
            setOpenCreateTaskWindow(false);
        }
    }, [mode]);

    // Effect inicial para setup
    useEffect(() => {
        const appWindow = getCurrentWindow();
        let unlistenFocus: UnlistenFn | undefined = undefined;
        let unlistenBlur: UnlistenFn | undefined = undefined;

        const setupListeners = async () => {
            try {
                unlistenFocus = await appWindow.listen('tauri://focus', () => {
                    setIsWindowFocused(true);
                });
    
                unlistenBlur = await appWindow.listen('tauri://blur', () => {
                    setIsWindowFocused(false);
                });
    
                const focused = await appWindow.isFocused();
                setIsWindowFocused(focused);
            } catch (error) {
                throw error;
            }
        };

        setupListeners();
        getDatabaseInstance().then((connection) => {
            if (connection) {
                getTasks(connection).then(setTasks);
            }
        });

        return () => {
            if (unlistenFocus) unlistenFocus();
            if (unlistenBlur) unlistenBlur();
            dbConnection.current?.close();
        };
    }, []);

    const values = {
        isWindowFocused, 
        tasks, 
        setTasks,
        clock,
        setClock,
        mode, 
        setMode,
        clockState,
        setClockState,
        openCreateTaskWindow,
        setOpenCreateTaskWindow,
        dbConnection: dbConnection.current,
    };

    return (
        <Context.Provider value={values}>
            {children}
        </Context.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(Context);

    if (!context) {
        throw new Error("useAppContext must be used within a AppContextProvider");
    }

    return context;
};