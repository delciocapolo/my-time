import { TIME_CONFIGS } from "@src/constants";
import type { AppMode } from "../../app/types";
import { addSeconds, format } from "date-fns";

export const formatTime = (seconds: number): string => {
    const baseDate = new Date(0);
    const targetDate = addSeconds(baseDate, seconds);
    return format(targetDate, 'mm:ss');
};

export const getInitialTime = (currentMode: AppMode): number => {
    return TIME_CONFIGS[currentMode];
};