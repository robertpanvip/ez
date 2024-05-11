import type {VNode, Attributes, ComponentType, ComponentChildren, ComponentChild} from "ez";
import type {JSXInternal} from "./jsx.ts";
import {Fragment, generateKey} from 'ez';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
function createVNode(type: VNode["type"], props: any, key: VNode['key'], isStaticChildren: unknown, __source: unknown, __self: unknown) {
    if (!props) props = {};
    // We'll want to preserve `ref` in props to get rid of the need for
    // forwardRef components in the future, but that should happen via
    // a separate PR.
    let normalizedProps: any = props,
        ref: any,
        i;

    if ('ref' in normalizedProps) {
        normalizedProps = {};
        for (i in props) {
            if (i == 'ref') {
                ref = props[i];
            } else {
                normalizedProps[i] = props[i];
            }
        }
    }
    /** @type {VNode & { __source: any; __self: any }} */
    const vNode = {
        type,
        props: normalizedProps,
        key,
        ref,
        _children: null,
        _parent: null,
        _depth: 0,
        _dom: null,
        _nextDom: undefined,
        _component: null,
        constructor: undefined,
        _index: -1,
        _flags: 0,
        __source,
        __self
    };

    // If a Component VNode, check for and apply defaultProps.
    // Note: `type` is often a String, and can be `undefined` in development.
    if (typeof type === 'function' && (ref = type.defaultProps)) {
        for (i in ref)
            if (typeof normalizedProps[i] === 'undefined') {
                normalizedProps[i] = ref[i];
            }
    }
    vNode.key = key || generateKey();
    return vNode;
}



export function jsxDEV(
    type: string,
    props: JSXInternal.HTMLAttributes &
        JSXInternal.SVGAttributes &
        Record<string, any> & { children?: ComponentChildren, a:number },
    key?: string
): VNode<any>;

export function jsxDEV<P>(
    type: ComponentType<P>,
    props: Attributes & P & { children?: ComponentChildren, a:number },
    key?: string
): VNode<any>;

export function jsxDEV(type: any,
                       props: any,
                       key?: any,
                       isStatic?: boolean,
                       __source?: any,
                       __self?: any
) {
    return createVNode(type, props, key, isStatic, __source, __self)
}

export function jsx(
    type: string,
    props: JSXInternal.HTMLAttributes &
        JSXInternal.SVGAttributes &
        Record<string, any> & { children?: ComponentChild },
    key?: string
): VNode<any>;
export function jsx<P>(
    type: ComponentType<P>,
    props: Attributes & P & { children?: ComponentChild },
    key?: string
): VNode<any>;
export function jsx(type: any,
                    props: any,
                    key?: any) {
    return createVNode(type, props, key, null, null, null)
}

export {JSXInternal, JSXInternal as JSX};

export {
    Fragment,
};