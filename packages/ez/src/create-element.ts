import {generateKey, slice} from './util';
import {JSX as JSXInternal, SignalLike} from "ez";
import type {ClassAttributes, ComponentChildren, RefObject, RenderableProps, VNode} from "./index.ts";
import {CONTEXT} from "./share.ts";

export function createElement(
    type: 'input',
    props:
        | (JSXInternal.DOMAttributes<HTMLInputElement> &
        ClassAttributes<HTMLInputElement>)
        | null,
    ...children: ComponentChildren[]
): VNode<
    | JSXInternal.DOMAttributes<HTMLInputElement> &
    ClassAttributes<HTMLInputElement>
>;
export function createElement<
    P extends JSXInternal.HTMLAttributes<T>,
    T extends HTMLElement
>(
    type: keyof JSXInternal.IntrinsicElements,
    props: (ClassAttributes<T> & P) | null,
    ...children: ComponentChildren[]
): VNode<ClassAttributes<T> & P>;

export function createElement<
    P extends JSXInternal.SVGAttributes<T>,
    T extends HTMLElement
>(
    type: keyof JSXInternal.IntrinsicElements,
    props: (ClassAttributes<T> & P) | null,
    ...children: ComponentChildren[]
): VNode<ClassAttributes<T> & P>;

export function createElement<T extends HTMLElement>(
    type: string,
    props:
        | (ClassAttributes<T> &
        JSXInternal.HTMLAttributes &
        JSXInternal.SVGAttributes)
        | null,
    ...children: ComponentChildren[]
): VNode<
    ClassAttributes<T> & JSXInternal.HTMLAttributes & JSXInternal.SVGAttributes
>;
export function createElement(type: any, props: any, ...children: any[]): VNode<any> {
    const normalizedProps: any = {}
    let key,
        ref,
        i;
    for (i in props) {
        if (i == 'key') key = props[i];
        else if (i == 'ref') ref = props[i];
        else normalizedProps[i] = props[i];
    }

    if (arguments.length > 2) {
        normalizedProps.children =
            // eslint-disable-next-line prefer-rest-params
            arguments.length > 3 ? slice.call(arguments, 2) : children;
    }

    // If a Component VNode, check for and apply defaultProps
    // Note: type may be undefined in development, must never error here.
    if (typeof type == 'function' && type.defaultProps != null) {
        for (i in type.defaultProps) {
            if (normalizedProps[i] === undefined) {
                normalizedProps[i] = type.defaultProps[i];
            }
        }
    }
    const vNode = createVNode(type, normalizedProps, key, ref);
    CONTEXT.set(vNode, {});
    return vNode;
}

/**
 * Create a VNode (used internally by Preact)
 * @param {VNode["type"]} type The node name or Component
 * Constructor for this virtual node
 * @param {object | string | number | null} props The properties of this virtual node.
 * If this virtual node represents a text node, this is the text of the node (string or number).
 * @param {string | number | null} key The key for this virtual node, used when
 * diffing it against its children
 * @param {VNode["ref"]} ref The ref property that will
 * receive a reference to its created child
 * @returns {VNode}
 */
export function createVNode(
    type: VNode["type"],
    props?: object | string | number | null,
    key?: string | number | null,
    ref?: VNode["ref"],
) {
    const vNode = {
        type,
        props,
        key,
        ref,
        _children: null,
        _parent: null,
        _depth: 0,
        _dom: null,
        // _nextDom must be initialized to undefined b/c it will eventually
        // be set to dom.nextSibling which can return `null` and it is important
        // to be able to distinguish between an uninitialized _nextDom and
        // a _nextDom that has been set to `null`
        _nextDom: undefined,
        _component: null,
        constructor: undefined,
        _index: -1,
        _flags: 0
    }
    vNode.key = key || generateKey();
    // V8 seems to be better at detecting type shapes if the object is allocated from the same call site
    // Do not inline into createElement and coerceToVNode!
    return vNode;
}

export function createRef<T>(): RefObject<T> {
    return {current: null};
}

export function Fragment<P = NonNullable<unknown>>(props: RenderableProps<P>) {
    return props.children;
}

export function isValidElement(vnode: any): vnode is VNode {
    return vnode != null && vnode.constructor == undefined;
}

export function isValidSignal(vnode: any): vnode is SignalLike<any> {
    if (typeof vnode === 'object' && vnode !== null) {
        return typeof vnode.subscribe === 'function' && 'value' in vnode
    }
    return false
}