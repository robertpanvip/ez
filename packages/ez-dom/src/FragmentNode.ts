import {ComponentChild} from "ez";

type CommentNode = Comment & { effect: ChildNode[], cc: ComponentChild };

class FragmentNode {
    effect: ChildNode[] = [];
    master: ChildNode | null = null;
    cc: ComponentChild = null;

    constructor(node?: ChildNode) {
        this.master = node || null;
    }

    get firstChild() {
        return this.effect[0] || null
    }

    get lastChild() {
        return this.effect[this.effect.length - 1] || null
    }

    after(...nodes: (FragmentNode | string)[]) {
        if (this.master) {
            const lastNode = this.lastChild;
            if (lastNode) {
                lastNode.after(...nodes.flatMap((node) => {
                    if (typeof node === 'string') {
                        return [document.createComment(node)];
                    } else {
                        return [node.master!, ...node.effect]
                    }
                }))
            }
        }
    }

    remove() {
        this.effect.forEach(e => {
            e.remove();
        });
        this.master?.remove();
    }

    replaceWith(node: FragmentNode) {
        if (node.master && this.master) {
            const now = node.effect;
            const previous = this.effect;
            previous.forEach((item) => {
                item.remove();
            })
            now.forEach((item) => {
                this.master!.after(item);
            });
            const master = (this.master as CommentNode);
            const nodeMaster = (node.master as CommentNode);
            if (master.nodeType === 8 && master.data === 'ez' && nodeMaster.nodeType === 8 && nodeMaster.data === 'ez') {
                master.effect = (node.master as CommentNode).effect;
                master.cc = (node.master as CommentNode).cc;
            } else {
                master.replaceWith(node.master)
            }
        }
    }

    static createFragmentNode(data: string,) {
        const start = document.createComment(data) as unknown as FragmentNode;
        (start).effect = [];
        return start;
    }


    static geChildFragmentNodes(_node: Node) {
        const nodes: FragmentNode[] = [];
        let child = _node.firstChild;
        while (child) {
            if (child.nodeType === 8) {
                const current: FragmentNode = new FragmentNode();
                const _child: ChildNode[] = [];
                const tmp = child;
                const item = child as unknown as FragmentNode
                const commentNodeChildren = (item).effect || [];
                current.cc = item.cc;
                commentNodeChildren.forEach(item => {
                    _child.push(item);
                    if (child) {
                        child = child.nextSibling;
                    }
                });
                current.effect.push(..._child);
                current.master = tmp;
                nodes.push(current)
            } else {
                const current: FragmentNode = new FragmentNode();
                current.master = child;
                nodes.push(current)
            }
            child = child.nextSibling;
        }
        return nodes
    }

}

export default FragmentNode