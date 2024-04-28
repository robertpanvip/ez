import {JSXInternal} from 'ez/jsx-runtime';

export interface VNode<P = NonNullable<unknown>> {
    type: ComponentType<P> | string;
    props: P & { children: ComponentChildren };
    key: Key;
    previousSibling?: null | VNode
    /**
     * ref is not guaranteed by React.ReactElement, for compatibility reasons
     * with popular react libs we define it as optional too
     */
    ref?: Ref<any> | null;
    /**
     * The time this `vnode` started rendering. Will only be set when
     * the devtools are attached.
     * Default value: `0`
     */
    startTime?: number;
    /**
     * The time that the rendering of this `vnode` was completed. Will only be
     * set when the devtools are attached.
     * Default value: `-1`
     */
    endTime?: number;
}

//
// Preact Component interface
// -----------------------------------

export type Key = string | number | any;

export type RefObject<T> = { current: T | null };
export type RefCallback<T> = (instance: T | null) => void;
export type Ref<T> = RefObject<T> | RefCallback<T> | null;

export type ComponentChild =
    | VNode<any>
    | object
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined;
export type ComponentChildren = ComponentChild[] | ComponentChild;

export interface Attributes {
    key?: Key | undefined;
    jsx?: boolean | undefined;
}

export interface ClassAttributes<T> extends Attributes {
    ref?: Ref<T>;
}

export interface PreactDOMAttributes {
    children?: ComponentChildren;
    dangerouslySetInnerHTML?: {
        __html: string;
    };
}

export interface ErrorInfo {
    componentStack?: string;
}

export type RenderableProps<P, RefType = any> = P &
    Readonly<Attributes & { children?: ComponentChildren; ref?: Ref<RefType> }>;

export type ComponentType<P = NonNullable<unknown>> = FunctionComponent<P>;
export type ComponentFactory<P = NonNullable<unknown>> = ComponentType<P>;

export type ComponentProps<
    C extends ComponentType<any> | keyof JSXInternal.IntrinsicElements
> = C extends ComponentType<infer P>
    ? P
    : C extends keyof JSXInternal.IntrinsicElements
        ? JSXInternal.IntrinsicElements[C]
        : never;

export interface FunctionComponent<P = NonNullable<unknown>> {
    (props: RenderableProps<P>, context?: any): VNode<any> | null;

    displayName?: string;
    defaultProps?: Partial<P> | undefined;
}

export interface FunctionalComponent<P = NonNullable<unknown>> extends FunctionComponent<P> {
}

export {
    IS_NON_DIMENSIONAL
} from './const';
export {
    getCurrentInstance,
    setCurrentInstance
} from './share';
export {
    getPositionKey,
} from './util';
export type {
    JSX,
    JSX as Ez
} from 'ez/jsx-runtime';

export {
    createElement,
    Fragment,
    createRef,
    isValidElement
} from './create-element';
export {
    useState,
    useRef,
    effect,
} from './hooks';
export {
    createSignal,
} from './create-signal.ts';