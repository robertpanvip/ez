import target, {BusEventTarget} from "./bus";

export const CONTEXT = new WeakMap<object, object>()
export const Current: {
    current: Record<string, any> | null,
    target: BusEventTarget,
} = {
    current: null,
    target
}
export const busTarget = Current.target

export function getCurrentInstance() {
    return Current.current;
}

export function setCurrentInstance(val: Record<string, any> | null) {
    return Current.current = val;
}