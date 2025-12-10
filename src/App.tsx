import { Activity, useEffect, useRef } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { LogicalSize } from "@tauri-apps/api/dpi";
import Timer from "./components/app/timer";
import { useAppContext } from "./global/context/app";
import TasksSection from "./components/molecules/controls/molecules/handle-create-task/task-section";
import * as console from "@tauri-apps/plugin-log";

type HandleResizeWindowProps = {
  heightPixels: number;
  appWindowRef: HTMLDivElement;
}
async function handleResizeWindow({ appWindowRef, heightPixels }: HandleResizeWindowProps) {
  try {
      const webview = getCurrentWebviewWindow();
      
      // Obter o tamanho atual da janela em pixels lógicos
      const currentSize = await webview.innerSize();
      const scaleFactor = await webview.scaleFactor();
      
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const rect = appWindowRef.getBoundingClientRect();
      // Converter para pixels lógicos e usar a largura atual
      const width = currentSize.width / scaleFactor;
      const height = (Math.ceil(rect.height) + heightPixels);
      
      await webview.setSize(new LogicalSize(width, height));
    } catch (error) {
      await console.error(JSON.stringify(error));
    }
}

export default function App() {
  const { mode, isWindowFocused } = useAppContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const increaseResizeWindow = async () => {
    if (!contentRef.current) return;
    handleResizeWindow({ 
      appWindowRef: contentRef.current,
      heightPixels: 150
    });
  }
  
  const decreaseResizeWindow = async () => {
    if (!contentRef.current) return;
    handleResizeWindow({ 
      appWindowRef: contentRef.current,
      heightPixels: 75
    });
  }

  const debouncedResize = () => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      increaseResizeWindow();
    }, 100);
  };

  useEffect(() => {
    if (isWindowFocused) {
      increaseResizeWindow();
    } else {
      decreaseResizeWindow();
    }
  }, [isWindowFocused]);

  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver(() => {
      debouncedResize();
    });

    observer.observe(contentRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={contentRef} className="sm:max-w-md mx-auto">
      <div className="w-full space-y-3">
        <Timer />
        
        <Activity mode={mode === "pomodoro" ? "visible" : "hidden"}>
          <div className="w-full">
            <TasksSection />
          </div>
        </Activity>
      </div>
    </div>
  );
}