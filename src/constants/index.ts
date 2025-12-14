import { AppMode } from "@src/global/context/app/types";

export const DEFAULT_MODE: AppMode = "pomodoro";
export const TIMER_CLOCK_STRING: string = "25:00";
export const TIMER_CLOCK_TIMES = {
    POMODORO: 25,
    FOCUS: 50,
    PAUSE: 5
};
export const TIME_CONFIGS = {
    pomodoro: TIMER_CLOCK_TIMES.POMODORO * 60,
    focus: TIMER_CLOCK_TIMES.FOCUS * 60,
    pause: TIMER_CLOCK_TIMES.PAUSE * 60,
} as const;
