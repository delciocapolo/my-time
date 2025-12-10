import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ComponentProps } from "@src/shared/@types/component-props";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { UnlistenFn } from "@tauri-apps/api/event";
import { Task } from "@src/shared/@types/task";
import Database from '@tauri-apps/plugin-sql';
import { getTasks, updateTask } from "@src/services/repository/tasks";
import * as console from "@tauri-apps/plugin-log";
import { format, addSeconds, differenceInSeconds } from "date-fns";
import { TIMER_CLOCK_TIMES, TIMER_CLOCK_STRING } from "@src/constants";

export type AppMode = "pomodoro" | "focus" | "pause";
export type AppClockMode = "start" | "refresh" | "stop";

type ContextType = {
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

const Context = createContext<ContextType | undefined>(undefined);

// Configurações de tempo (em segundos)
const TIME_CONFIGS = {
    pomodoro: TIMER_CLOCK_TIMES.POMODORO * 60,  // 25 minutos
    focus: TIMER_CLOCK_TIMES.FOCUS * 60,        // 50 minutos
    pause: TIMER_CLOCK_TIMES.PAUSE * 60,        // 5 minutos
} as const;

export const AppProvider = ({ children }: ComponentProps) => {
    const [tasks, handleTasks] = useState<Task[]>([]);
    const [clock, handleClock] = useState<string>(TIMER_CLOCK_STRING);
    const [mode, handleMode] = useState<AppMode>("pomodoro");
    const [clockState, handleClockState] = useState<AppClockMode>("stop");
    const [isWindowFocused, setIsWindowFocused] = useState<boolean>(false);
    const [openCreateTaskWindow, handleOpenCreateTaskWindow] = useState<boolean>(false);
    const dbConnection = useRef<Database | undefined>(undefined);
    const timerInterval = useRef<NodeJS.Timeout | null>(null);
    const endTime = useRef<Date | null>(null);
    const isRunningCycle = useRef<boolean>(false);
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
            console.error(error?.message || "Error to connect to database");
            return undefined;
        }
    };

    const setTasks = (list: Task[]) => {
        handleTasks(list);
        tasksRef.current = list; // Atualiza o ref também
    };

    const setClock = (clockTime: string) => {
        handleClock(clockTime);
    };

    // Formata segundos para "MM:SS" usando date-fns
    const formatTime = (seconds: number): string => {
        const baseDate = new Date(0);
        const targetDate = addSeconds(baseDate, seconds);
        return format(targetDate, 'mm:ss');
    };

    // Obtém o tempo inicial baseado no modo
    const getInitialTime = (currentMode: AppMode): number => {
        return TIME_CONFIGS[currentMode];
    };

    // Verifica se ainda há tarefas incompletas (usa ref para valor atual)
    const hasIncompleteTasks = (): boolean => {
        const incomplete = tasksRef.current.some(task => !task.is_completed);
        console.info(`[AppContext] Has incomplete tasks: ${incomplete} (Total: ${tasksRef.current.length})`);
        return incomplete;
    };

    // Completa a primeira tarefa não completada
    const completeFirstTask = async (): Promise<boolean> => {
        if (!dbConnection.current) {
            await console.error("[AppContext] Database connection not available");
            return false;
        }

        // Usa tasksRef para pegar o valor mais recente
        const firstIncompleteTask = tasksRef.current.find(task => !task.is_completed);
        
        if (!firstIncompleteTask) {
            await console.info("[AppContext] No incomplete tasks to complete");
            return false;
        }

        try {
            await console.info(`[AppContext] Completing task ID: ${firstIncompleteTask.id} - "${firstIncompleteTask.description}"`);
            
            const updated = await updateTask(dbConnection.current, { 
                id: firstIncompleteTask.id, 
                isCompleted: true 
            });

            if (updated) {
                await console.info(`[AppContext] Task ${firstIncompleteTask.id} marked as completed`);
                
                // Atualiza a lista de tarefas
                const updatedTasks = await getTasks(dbConnection.current);
                setTasks(updatedTasks);
                
                await console.info(`[AppContext] Tasks updated. Remaining incomplete: ${updatedTasks.filter(t => !t.is_completed).length}`);
                
                return true;
            }
            
            return false;
        } catch (error) {
            await console.error(`[AppContext] Error completing task: ${JSON.stringify(error)}`);
            return false;
        }
    };

    // Para o timer
    const stopTimer = async () => {
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
            endTime.current = null;
            await console.info("[AppContext] Timer stopped");
        }
    };

    // Reseta o timer
    const resetTimer = async () => {
        await stopTimer();
        isRunningCycle.current = false;
        const initialSeconds = getInitialTime(mode);
        setClock(formatTime(initialSeconds));
        await console.info("[AppContext] Timer reset");
    };

   // Inicia um único ciclo de timer
    const startSingleTimer = async () => {
        await console.info("[AppContext] Starting single timer cycle...");
        
        const initialSeconds = getInitialTime(mode);
        endTime.current = addSeconds(new Date(), initialSeconds);

        if (timerInterval.current) {
            clearInterval(timerInterval.current);
        }

        timerInterval.current = setInterval(async () => {
            if (!endTime.current) return;

            const now = new Date();
            const remaining = differenceInSeconds(endTime.current, now);

            if (remaining <= 0) {
                await stopTimer();
                setClock("00:00");
                
                await console.info("[AppContext] Timer cycle completed!");
                
                if (mode === "pomodoro") {
                    const taskCompleted = await completeFirstTask();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const stillHasTasks = hasIncompleteTasks();
                    
                    if (taskCompleted && stillHasTasks && isRunningCycle.current) {
                        await console.info("[AppContext] Restarting timer for next task...");
                        await startSingleTimer();
                    } else {
                        // Pára completamente
                        await handleTimerComplete();
                    }
                } else {
                    await handleTimerComplete();
                }
            } else {
                setClock(formatTime(remaining));
            }
        }, 1000);
    };

    // Nova função para finalizar o timer
    const handleTimerComplete = async () => {
        isRunningCycle.current = false;
        await resetTimer();
        setClockState("stop");
        await console.info("[AppContext] Timer cycle finished");
    };

    // Inicia o ciclo completo de timers
    const startTimerCycle = async () => {
        if (!hasIncompleteTasks()) {
            await console.warn("[AppContext] No incomplete tasks to start timer");
            setClockState("stop");
            return;
        }

        await console.info("[AppContext] Starting timer cycle for all tasks...");
        isRunningCycle.current = true;
        await startSingleTimer();
    };

    const handleClockStateChange = async () => {
        if (clockState === "start") {
            await startTimerCycle();
        } else if (clockState === "stop") {
            isRunningCycle.current = false;
            await stopTimer();
        } else if (clockState === "refresh") {
            await resetTimer();
            setClockState("stop");
        }
    };

    // Effect para sincronizar tasks com tasksRef
    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);

    // Effect para gerenciar o timer baseado no estado
    useEffect(() => {
        handleClockStateChange();

        return () => {
            isRunningCycle.current = false;
            stopTimer();
        };
    }, [clockState]);

    // Effect para resetar o timer quando mudar de modo
    useEffect(() => {
        resetTimer();
        
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
            isRunningCycle.current = false;
            stopTimer();
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