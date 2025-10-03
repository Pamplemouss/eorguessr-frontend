export function lerp(start: number, end: number, t: number) {
    return start * (1 - t) + end * t;
}

export function invLerp(from: number, to: number, value: number) {
    return (value - from) / (to - from);
}