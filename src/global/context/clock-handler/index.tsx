import { addSeconds, differenceInSeconds } from "date-fns";
import { createContext, useContext, useEffect, useRef } from "react";
import { ContextType } from "./types";
import { ComponentProps } from "@src/shared/@types/component-props";
import { useAppContext } from "../app";
import { usePlaySound } from "@src/hooks/play-sound";
import * as console from "@tauri-apps/plugin-log";
import { getTasks, updateTask } from "@src/services/repository/tasks";
import { formatTime, getInitialTime } from "./utils";
import { AppMode } from "../app/types";

const Context = createContext<ContextType | undefined>(undefined);

export const ClockHandlerProvider = ({ children }: ComponentProps) => {
    const { clockState, mode, tasks, dbConnection, setTasks, setClock, setClockState, setMode } = useAppContext();
    const instanceAudio = usePlaySound({ path: '/assets/notification-sound/completed-task.wav' });
    const timerInterval = useRef<NodeJS.Timeout | null>(null);
    const endTime = useRef<Date | null>(null);
    const isRunningCycle = useRef<boolean>(false);
    const isPauseToNewCycle = useRef<boolean>(false);
    
    // handlers
    const setIsRunningCycle = (state: boolean) => {
        isRunningCycle.current = state;
    }

    const hasIncompleteTasks = (): boolean => {
        const incomplete = tasks.some(task => !task.is_completed);
        return incomplete;
    };

    const completeFirstTask = async (): Promise<boolean> => {
        if (!dbConnection) {
            await console.error("[AppContext] Database connection not available");
            return false;
        }

        const firstIncompleteTask = tasks.find(task => !task.is_completed);
        
        if (!firstIncompleteTask) {
            await console.info("[AppContext] No incomplete tasks to complete");
            return false;
        }

        try {
            const updated = await updateTask(dbConnection, { 
                id: firstIncompleteTask.id, 
                isCompleted: true 
            });

            if (updated) {
                const updatedTasks = await getTasks(dbConnection);
                setTasks(updatedTasks);
                return true;
            }
            
            return false;
        } catch (error) {
            await console.error(`[AppContext] Error completing task: ${JSON.stringify(error)}`);
            return false;
        }
    };

    const stopTimer = async () => {
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
            endTime.current = null;
            await console.info("[AppContext] Timer stopped");
        }
    };

    const resetTimer = async (targetMode?: AppMode) => {
        await stopTimer();
        isRunningCycle.current = false;
        const modeToUse = targetMode || mode;
        const initialSeconds = getInitialTime(modeToUse);
        setClock(formatTime(initialSeconds));
        await console.info(`[AppContext] Timer reset for mode: ${modeToUse}`);
    };

    const switchModeCycle = async (newMode: AppMode) => {
        isPauseToNewCycle.current = (newMode === "pause");
        
        await console.info(`[AppContext] Switching mode from ${mode} to ${newMode}`);
        setMode(newMode);
        return newMode;
    }

    const startSingleTimer = async (targetMode?: AppMode) => {
        try {
            const modeToUse = targetMode || mode;
            await console.info(`[AppContext] Starting single timer cycle in ${modeToUse} mode...`);
            
            const initialSeconds = getInitialTime(modeToUse);
            endTime.current = addSeconds(new Date(), initialSeconds);
    
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
            }
    
            timerInterval.current = setInterval(async () => {
                if (!endTime.current) return;
    
                try {
                    const now = new Date();
                    const remaining = differenceInSeconds(endTime.current, now);
        
                    if (remaining <= 0) {
                        await stopTimer();
                        setClock("00:00");
                        await console.info(`[AppContext] Timer cycle completed in ${modeToUse} mode!`);
                        await instanceAudio.play();

                        if (modeToUse === "pomodoro") {
                            const taskCompleted = await completeFirstTask();
                            const stillHasTasks = hasIncompleteTasks();
                            
                            if (taskCompleted && stillHasTasks) {
                                await console.info("[AppContext] Task completed, starting pause...");
                                const newMode = await switchModeCycle("pause");
                                setTimeout(async () => {
                                    await startSingleTimer(newMode);
                                }, 100);
                            } else {
                                await handleTimerComplete();
                            }
                        } else { 
                            // mode === "pause"
                            if (isPauseToNewCycle.current && hasIncompleteTasks()) {
                                await console.info("[AppContext] Pause completed, starting new pomodoro...");
                                const newMode = await switchModeCycle("pomodoro");
                                setTimeout(async () => {
                                    await startSingleTimer(newMode);
                                }, 100);
                            } else {
                                await handleTimerComplete();
                            }
                        }
                    } else {
                        setClock(formatTime(remaining));
                    }
                } catch (error) {
                    await console.error(JSON.stringify(error));
                }
            }, 1000);
        } catch (error) {
            await console.error(JSON.stringify(error));
        }
    };

    const handleTimerComplete = async () => {
        isRunningCycle.current = false;
        isPauseToNewCycle.current = false;
        await resetTimer();
        setClockState("stop");
        await console.info("[AppContext] Timer cycle finished");
    };

    const startTimerCycle = async () => {
        if (mode === "pomodoro" && !hasIncompleteTasks()) {
            await console.warn("[AppContext] No incomplete tasks to start pomodoro timer");
            setClockState("stop");
            return;
        }

        await console.info(`[AppContext] Starting timer cycle in ${mode} mode...`);
        isRunningCycle.current = true;
        await startSingleTimer(mode);
    };

    const handleClockStateChange = async () => {
        if (clockState === "start") {
            await startTimerCycle();
        } else if (clockState === "stop") {
            isRunningCycle.current = false;
            isPauseToNewCycle.current = false;
            await stopTimer();
        } else if (clockState === "refresh") {
            await resetTimer();
            setClockState("stop");
        }
    };

    // use-effects
    useEffect(() => {
        handleClockStateChange();
        
        return () => {
            isRunningCycle.current = false;
            stopTimer();
        };
    }, [clockState]);

    useEffect(() => {
        // só reseta o timer se for uma mudança manual (usuário) e não estiver em ciclo automático
        if (!isRunningCycle.current) {
            resetTimer();
        }
    }, [mode]);

    useEffect(() => {
        return () => {
            isRunningCycle.current = false;
            isPauseToNewCycle.current = false;
        }
    }, []);

    const values = {
        resetTimer,
        setIsRunningCycle,
        stopTimer,
    };

    return (
        <Context.Provider value={values}>
            {children}
        </Context.Provider>
    );
}

export const useClockHandlerContext = () => {
    const context = useContext(Context);

    if (!context) {
        throw new Error("useClockHandlerContext must be used within a ClockHandlerProvider");
    }

    return context;
};