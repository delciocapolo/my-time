// TODO: Actualização: o usuário vai poer informar qual o tempo

import { useAppContext } from "@src/global/context/app";
// import { Input } from "../ui/input";

export default function Timer() {
    // const { clock, setClock } = useAppContext();
    const { clock } = useAppContext();

    return (
        <div className="py-1 flex-center">
            {/* <Input
                className="
                    text-center text-display-72 text-5xl font-medium py-3 outline-none border-none
                    focus-visible:ring-0
                "
                value={clock}
                onChange={(event) => setClock(event.target.value)}
            /> */}
            <h1 className="text-display-72 text-7xl font-medium select-none cursor-default">{clock}</h1>
        </div>
    );
}
