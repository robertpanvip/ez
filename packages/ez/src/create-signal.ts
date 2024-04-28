import {JSXInternal} from "../jsx-runtime";
import {effect} from "./hooks.ts";

export function createSignal<T>(fn: () => T) {
    const subscribe = (update: (v: T) => void) => {
        effect(() => {
            const value = fn();
            update(value)
        });
    }
    return {
        $isSignal: true,
        subscribe
    } as JSXInternal.SignalLike<T>
}