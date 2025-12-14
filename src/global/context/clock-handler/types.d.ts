export type ContextType = {
    resetTimer: () => Promise<void>;
    setIsRunningCycle: (state: boolean) => void;
    stopTimer: () => Promise<void>;
};
