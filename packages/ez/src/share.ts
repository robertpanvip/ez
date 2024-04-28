export const CONTEXT = new WeakMap<object, object>()
export const Current: {
    current: Record<string, any> | null
} = {current: null}

export function getCurrentInstance() {
    return Current.current;
}

export function setCurrentInstance(val: Record<string, any> | null) {
    return Current.current = val;
}