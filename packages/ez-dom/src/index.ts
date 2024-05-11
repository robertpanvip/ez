import {
    ComponentChild,
    ComponentChildren,
    getCurrentInstance,
    isValidElement,
    isValidSignal,
    setCurrentInstance,
    SignalLike,
    VNode
} from "ez";
import {setProperty} from "./props";
import {assignRef} from "./util";
import FragmentNode from "./FragmentNode.ts";

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

function diffVNode(val: ComponentChild, previous: ComponentChild) {
    if (isValidElement(val) && isValidElement(previous)) {
        let key = val.key;
        let previousKey = previous.key
        if (isValidSignal(key)) {
            key = key.value;
        }
        if (isValidSignal(previousKey)) {
            previousKey = previousKey.value;
        }
        return key === previousKey;
    } else {
        return val === previous
    }
}

type CommentNode = Comment & { effect: ChildNode[], cc: ComponentChild };

function executeLifecycle(val: ComponentChild, method: string) {
    if (isValidElement(val)) {
        const instance = vm.get(val);
        if (instance) {
            instance.listeners[method].forEach((item: () => void) => item())
        }
    }
}

function renderSignal(signal: SignalLike<any>, ele: ContainerNode) {
    let mounted = false;
    let cache: FragmentNode[];
    let cacheVal: ComponentChildren = null;
    signal.subscribe((val: ComponentChildren) => {
        if (cacheVal
            && isValidElement(val)
            && isValidElement(cacheVal)
        ) {
            if (diffVNode(val, cacheVal)) {
                return
            }
        }
        let doc: DocumentFragment;
        const isArray = Array.isArray(val)
        if (isArray) {
            doc = document.createDocumentFragment();
            const loop = (val: Array<ComponentChildren>) => {
                val.forEach((item) => {
                    if (Array.isArray(item)) {
                        loop(item)
                    } else {
                        const start = document.createComment('ez');
                        const dom = render(item);
                        (start as CommentNode).effect = Array.from(dom.childNodes);
                        (start as CommentNode).cc = item;
                        doc.appendChild(start);
                        docAppendToNode(dom, doc);
                    }
                });
            }
            loop(val as Array<ComponentChildren>)
        } else {
            doc = render(val);
        }
        if (Array.from(doc.childNodes).length === 0) {
            val = [];
        }
        const fNodes = FragmentNode.geChildFragmentNodes(doc)
        if (!isArray) {
            console.log('VChildNodes', fNodes, cache);
        }

        if (mounted) {
            if (isValidElement(cacheVal)) {
                //卸载
                executeLifecycle(cacheVal, 'unmount')
            }

            let firstNode: FragmentNode = cache[cache.length - 1];
            fNodes.forEach((item, index) => {
                if (cache[index]) {

                    if (cache[index].cc === null || item.cc === null || !diffVNode(cache[index].cc, item.cc)) {
                        //卸载
                        executeLifecycle(cache[index].cc, 'unmounted')
                        console.log(item, cache[index], cache[index].cc, item.cc);
                        cache[index].replaceWith(item);
                        //卸载
                        executeLifecycle(item.cc, 'mounted')
                        firstNode = item;
                    }
                } else {
                    if (cache.length !== 0) {
                        firstNode.after(item);
                        //挂载
                        executeLifecycle(item.cc, 'mounted')
                    }
                }
            });
            cache.forEach((item, index) => {
                if (index > fNodes.length - 1) {
                    //卸载
                    executeLifecycle(item.cc, 'unmounted')
                    item.remove();
                }
            });
            cache = fNodes;
        } else {
            cache = fNodes;
            docAppendToNode(doc, ele);
            if (isValidElement(val)) {
                requestAnimationFrame(() => {
                    //挂载
                    executeLifecycle(val, 'mounted')
                })
            }
        }
        mounted = true;
        cacheVal = val;
    });
}

export function render(vNode: ComponentChildren): DocumentFragment {
    let dom: Element | Text | null = null;
    const doc = document.createDocumentFragment();
    if (isValidElement(vNode)) {
        if (typeof vNode.type === 'string') {
            dom = document.createElement(vNode.type);
            const {children, ...props} = vNode.props
            Object.entries(props).forEach(([prop, value]) => {
                setProperty(dom, prop, value, undefined, false)
            })
            doc.appendChild(dom);
            vNode.ref && assignRef(vNode.ref, dom);
            const _dom = render(children)
            docAppendToNode(_dom, dom)
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
    } else if (Array.isArray(vNode)) {
        (vNode as ComponentChildren[]).forEach(item => {
            const dom = render(item);
            docAppendToNode(dom, doc)
        })
    } else if (vNode !== false) {
        dom = document.createTextNode(`${vNode != 0 ? vNode || "" : 0}`);
        doc.appendChild(dom)
    } else if (!vNode) {
        const start = document.createComment('ez-empty');
        (start as CommentNode).effect = [];
        doc.appendChild(start)
    }
    return doc;
}

function docAppendToNode(doc: DocumentFragment, container: ContainerNode) {
    Array.from(doc.childNodes).forEach(item => {
        container.appendChild(item)
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