import '@fontsource-variable/roboto';
import '@fontsource-variable/inter';
import { useAppContext } from './global/context/app';
import CreateTaskWindow from './components/molecules/create-task';
import { Activity } from 'react';
import AppControls from './components/molecules/controls';
import App from './App';

export default function LayoutApp() {
    const { isWindowFocused } = useAppContext();

    return (
        <main className="px-7 py-7 space-y-6">
            <Activity mode={isWindowFocused ? "visible" : "hidden"}>
                <AppControls />
            </Activity>

            <App />
            
            <CreateTaskWindow />
        </main>
    );
}
