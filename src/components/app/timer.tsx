import { useAppContext } from "@src/global/context/app";

export default function Timer() {
    const { clock } = useAppContext();
    return (
        <div className="py-1 flex-center">
            <h1 className="text-display-72 text-7xl font-medium select-none cursor-default">{clock}</h1>
        </div>
    );
}
