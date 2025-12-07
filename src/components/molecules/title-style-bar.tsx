import { invoke } from "@tauri-apps/api/core";

export default function TitleBar() {
  const handleMinimize = async () => {
    await invoke('minimize_window');
  };

  const handleMaximize = async () => {
    await invoke('maximize_window');
  };

  const handleClose = async () => {
    await invoke('close_window');
  };
 
  return (
    <header 
      data-tauri-drag-region 
      className="h-10 flex items-center justify-between px-3 bg-transparent select-none"
    > 
      <div className="flex-1 flex items-center gap-2">
        <button
          onClick={handleClose}
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          aria-label="Fechar"
        />
        <button
          onClick={handleMinimize}
          className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
          aria-label="Minimizar"
        />
        {/* <button
          onClick={handleMaximize}
          className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
          aria-label="Maximizar"
        /> */}
      </div>

      <div className="flex-1 relative">
        <div className="relative text-center">
          {/* <h1 className="text-nowrap text-headline-24 font-medium">Meu Tempo</h1> */}
        </div>
        <div data-tauri-drag-region className="absolute inset-0 z-1" />
      </div>

      <div className="flex-1" data-tauri-drag-region />
    </header>
  );
}