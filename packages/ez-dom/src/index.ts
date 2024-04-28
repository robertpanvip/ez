import {ComponentChild, isValidElement} from "ez";
import {setProperty} from "./props";
import {setCurrentInstance} from "ez";
import {assignRef} from "./util";
import target, {BusEvent} from "./bus.ts";

interface ContainerNode {
    readonly nodeType: number;
    readonly parentNode: ContainerNode | null;
    readonly firstChild: ContainerNode | null;
    readonly childNodes: ArrayLike<ContainerNode>;

    insertBefore(node: ContainerNode, child: ContainerNode | null): ContainerNode;

    appendChild(node: ContainerNode): ContainerNode;

    removeChild(child: ContainerNode): ContainerNode;
}

const updateChildren = (item: any, ele: Element) => {
    if (typeof item === 'object' && item.$isSignal) {
        let mounted = false;
        let cache: ChildNode[];
        let cacheVNode: ComponentChild = null;
        item.subscribe?.((val: ComponentChild) => {
            if (cacheVNode && isValidElement(val) && isValidElement(cacheVNode) && val.key === cacheVNode.key) {
                return
            }
            const doc = render(val);
            const childNodes = Array.from(doc.childNodes);

            if (mounted) {
                if (isValidElement(cacheVNode)) {
                    //卸载
                }
                childNodes.forEach((item, index) => {
                    if (cache[index]) {
                        cache[index].replaceWith(item);
                    } else {
                        cache[cache.length - 1].after(item)
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
            }
            mounted = true;
            cacheVNode = val;
        });
    } else {
        const doc = render(item);
        docAppendToNode(doc, ele)
    }
}

function render(vNode: ComponentChild): DocumentFragment {
    let dom: Element | Text | null = null;
    const doc = document.createDocumentFragment();
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
            setCurrentInstance({
                refs: new WeakMap()
            })
            const _vNode = vNode.type(vNode.props);
            setCurrentInstance(null)
            const vNodes = Array.isArray(_vNode) ? _vNode : [_vNode]
            vNodes.forEach(item => {
                const fr = render(item);
                docAppendToNode(fr, doc)
            });

        }
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
            const doc = render(vNode);
            docAppendToNode(doc, parent);
            target.dispatchEvent(new BusEvent('mounted'))
        }
    }
}