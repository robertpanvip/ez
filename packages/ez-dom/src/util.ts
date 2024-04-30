import type {Ref} from "ez";
import {JSX} from "ez";
import {isValidSignal} from "ez/src/create-element.ts";

export function assignRef<T>(ref: Ref<T> | JSX.SignalLike<Ref<T>>, dom: T | null) {
    const assign = (ref: Ref<T>, dom: T | null) => {
        typeof ref === 'function' ? ref(dom) : (ref && (ref.current = dom));
    }
    if (isValidSignal(ref)) {
        ref.subscribe((val: Ref<T>) => {
            assign(val, dom)
        })
    } else {
        assign(ref, dom)
    }

}