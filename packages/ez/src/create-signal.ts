import {JSXInternal} from "../jsx-runtime";
import {effect} from "./hooks.ts";


export function createSignal<T>(fn: () => T) {
    const subscribe = (update: (v: T) => void) => {
        effect(() => {
            const value = fn();
            update(value);
        });
    }

    const signal: JSXInternal.SignalLike<T> = {
        $$signal: "Signal",
        subscribe,
        valueOf() {
            return this.value;
        },
        get value() {
            const value = fn();
            return value as T
        }
    }
    return signal
}