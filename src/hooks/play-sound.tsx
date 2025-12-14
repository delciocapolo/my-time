type PlaySoundProps = {
    path: string;
}

export const usePlaySound = ({ path }: PlaySoundProps) => {
    const audio = new Audio(path);
    return audio;
}
