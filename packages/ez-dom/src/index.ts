import {
    ComponentChild,
    ComponentChildren,
    getCurrentInstance,
    isValidElement,
    isValidSignal,
    SignalLike,
    VNode
} from "ez";
import {setProperty} from "./props";
import {setCurrentInstance} from "ez";
import {assignRef} from "./util";

const vm = new WeakMap<VNode, Record<string, any>>()

interface ContainerNode {
    readonly nodeType: number;
    readonly parentNode: ContainerNode | null;
    readonly firstChild: ContainerNode | null;
    readonly childNodes: ArrayLike<ContainerNode>;

    insertBefore(node: ContainerNode, child: ContainerNode | null): ContainerNode;

    appendChild(node: ContainerNode): ContainerNode;

    removeChild(child: ContainerNode): ContainerNode;
}

function renderSignal(signal: SignalLike<any>, ele: ContainerNode) {
    let mounted = false;
    let cache: ChildNode[];
    let cacheVal: ComponentChildren = null;
    signal.subscribe((val: ComponentChildren) => {
        console.log(val);

        if (cacheVal
            && isValidElement(val)
            && isValidElement(cacheVal)
            && val.key === cacheVal.key
            && val.type === cacheVal.type
        ) {
            return
        }
        let doc: DocumentFragment;
        if (Array.isArray(val)) {
            doc = document.createDocumentFragment();
            val.forEach((item) => {
                updateChildren(item, doc);
            });
        } else {
            doc = render(val);
        }

        let childNodes = Array.from(doc.childNodes);
        if (childNodes.length === 0) {
            const comment = document.createComment('ez');
            doc.appendChild(comment)
            childNodes = [comment]
        }

        if (mounted) {
            if (isValidElement(cacheVal)) {
                //卸载
                const instance = vm.get(cacheVal);
                if (instance) {
                    instance.listeners.unmount.forEach((item: () => void) => item())
                }
            }
            let firstNode: ChildNode = cache[cache.length - 1];
            childNodes.forEach((item, index) => {
                if (cache[index]) {
                    cache[index].replaceWith(item);
                    firstNode = item;
                } else {
                    if (cache.length !== 0) {
                        firstNode.after(item);
                    }
                }
            });
            cache.forEach((item, index) => {
                if (index > childNodes.length - 1) {
                    item.remove();
                }
            });
            cache = childNodes;
        } else {
            cache = childNodes;
            docAppendToNode(doc, ele);
            if (isValidElement(val)) {
                requestAnimationFrame(() => {
                    const instance = vm.get(val);
                    if (instance) {
                        instance.listeners.mounted.forEach((item: () => void) => item())
                    }
                })
            }
        }
        mounted = true;
        cacheVal = val;
    });
}

const updateChildren = (item: ComponentChild, ele: ContainerNode) => {
    if (isValidSignal(item)) {
        renderSignal(item, ele)
    } else {
        const doc = render(item);
        docAppendToNode(doc, ele)
    }
}

function render(vNode: ComponentChildren): DocumentFragment {
    let dom: Element | Text | null = null;
    const doc = document.createDocumentFragment();
    console.log(vNode);
    if (isValidElement(vNode)) {
        if (typeof vNode.type === 'string') {
            dom = document.createElement(vNode.type);
            const {children, ...props} = vNode.props
            Object.entries(props).forEach(([prop, value]) => {
                setProperty(dom, prop, value, undefined, false)
            })
            if (Array.isArray(children)) {
                children.forEach((item) => {
                    updateChildren(item, dom as Element);
                });
            } else {
                updateChildren(children, dom as Element)
            }
            doc?.appendChild(dom);
            vNode.ref && assignRef(vNode.ref, dom);
        } else {
            const currentInstance = getCurrentInstance();
            const instance = {
                refs: new WeakMap(),
                props: vNode.props,
                vNode,
                listeners: {
                    mounted: [],
                    unmount: []
                }
            }
            vm.set(vNode, instance)
            setCurrentInstance(instance)
            const proxy = new Proxy(vNode.props, {
                get(target, key) {
                    return Reflect.get(target, key)
                },
            })
            const _vNode = vNode.type(proxy);

            setCurrentInstance(currentInstance)
            const vNodes = Array.isArray(_vNode) ? _vNode : [_vNode]
            vNodes.forEach(item => {
                const fr = render(item);
                docAppendToNode(fr, doc)
            });

        }
    } else if (isValidSignal(vNode)) {
        renderSignal(vNode, doc)
    } else if (vNode !== false) {
        dom = document.createTextNode(`${vNode != 0 ? vNode || "" : 0}`);
        doc?.appendChild(dom)
    }
    return doc;
}

function docAppendToNode(doc: DocumentFragment, node: ContainerNode) {
    Array.from(doc.childNodes).forEach(item => {
        node.appendChild(item)
    })
}

export function createRoot(parent: ContainerNode) {
    return {
        render: (vNode: ComponentChild) => {
            setCurrentInstance({})
            const doc = render(vNode);
            docAppendToNode(doc, parent);
            setCurrentInstance(null)
        }
    }
}