import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { Activity, useEffect, useRef } from "react";
import Timer from "./components/app/timer";
import { useAppContext } from "./global/context/app";
import TasksSection from "./components/molecules/controls/molecules/handle-create-task/task-section";
import * as console from "@tauri-apps/plugin-log";

namespace NodeJS {
  export type Timeout = ReturnType<typeof setTimeout>;
}

export default function App() {
  const { isWindowFocused, mode } = useAppContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const resizeWindow = async () => {
    if (!contentRef.current) return;

    try {
      const webview = getCurrentWebviewWindow();
      
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const rect = contentRef.current.getBoundingClientRect();
      const width = Math.max(300, Math.ceil(rect.width));
      const height = Math.ceil(rect.height) + 120;
      
      await webview.setSize(new LogicalSize(width, height));
    } catch (error) {
      await console.error(JSON.stringify(error));
    }
  }
  
  const resizeWindowDecrease = async () => {
    if (!contentRef.current) return;

    try {
      const webview = getCurrentWebviewWindow();
      
      // Aguarda renderização completa
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const heightDifference: number = 70; // mode === "focus" ? 70 : 53 // TODO: revisar depois
      const rect = contentRef.current.getBoundingClientRect();
      const width = Math.max(300, Math.ceil(rect.width));
      const height = Math.ceil(rect.height) + heightDifference;
      
      await webview.setSize(new LogicalSize(width, height));
    } catch (error) {
      await console.error(JSON.stringify(error));
    }
  };

  const debouncedResize = () => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      resizeWindow();
    }, 100);
  };

  useEffect(() => {
    if (isWindowFocused) {
      resizeWindow();
    } else {
      resizeWindowDecrease();
    }
  }, [isWindowFocused]);

  useEffect(() => {
    resizeWindow();

    if (!contentRef.current) return;

    const observer = new ResizeObserver(() => {
      debouncedResize();
    });

    observer.observe(contentRef.current);

    return () => {
      observer.disconnect();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={contentRef} className="w-full space-y-5">
      <Timer />
      
      <Activity mode={mode === "pomodoro" ? "visible" : "hidden"}>
        <div className="w-full">
          <TasksSection />
        </div>
      </Activity>
    </div>
  );
}
