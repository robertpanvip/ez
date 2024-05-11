import {getCurrentInstance, RefObject} from "./index";

export type Dispatch<A> = (value: A) => void;
export type StateUpdater<S> = S | ((prevState: S) => S);

function invokeOrReturn<S, A>(arg: A, f: S | ((a: A) => S)) {
    return typeof f == 'function' ? (f as (a: A) => S)(arg) : f;
}

type Effect<T> = () => T;
const vm = new WeakMap<Record<string, any>, Effect<any>[]>()
let currentEffect: (Effect<any>) | null = null;

export function useState<S>(initialState: S | (() => S)): readonly [(() => S), ((value: StateUpdater<S>) => void)] {
    const context = getCurrentInstance();
    let val: S = invokeOrReturn(undefined, initialState);
    const getter = () => {
        //收集依赖
        if (currentEffect && context) {
            const effects = vm.get(context);
            if (!effects) {
                vm.set(context, [currentEffect])
            } else {
                vm.set(context, [...effects, currentEffect])
            }
        }
        return val
    }
    const setter = (value: StateUpdater<S>) => {
        if (context) {
            val = invokeOrReturn(val, value);
            const effects = vm.get(context);
            effects!.forEach(effect => effect())
        }
    }
    return [getter, setter] as const;
}

export function useRef<T>(): RefObject<T> {
    const instance = getCurrentInstance();
    if (instance) {
        return {current: null};
    }
    return {current: null};
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useMounted(fn: () => (() => void) | void) {
    const context = getCurrentInstance();
    if (context) {
        context.listeners.mounted.push(() => {
            const onMounted = fn();
            if (onMounted && typeof onMounted === 'function') {
                context.listeners.unmount.push(onMounted)
            }
        })
    }
}

export function useUnMounted(fn: () => void) {
    const context = getCurrentInstance();
    if (context) {
        context.listeners.unmount.push(() => {
            fn();
        })
    }
}


export function effect<T>(fn: () => T) {
    const temp = currentEffect;
    currentEffect = () => fn();
    const res = currentEffect!();
    currentEffect = temp;
    return res;
}