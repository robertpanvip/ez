import type {Ref} from "ez";
import {JSX} from "ez";

export function assignRef<T>(ref: Ref<T> | JSX.SignalLike<Ref<T>>, dom: T | null) {
    const assign = (ref: Ref<T>, dom: T | null) => {
        typeof ref === 'function' ? ref(dom) : (ref && (ref.current = dom));
    }
    if (typeof ref === 'object' && ref !== null && "$isSignal" in ref) {
        (ref as JSX.SignalLike<Ref<T>>).subscribe?.((val: Ref<T>) => {
            assign(val, dom)
        })
    } else {
        assign(ref, dom)
    }

}