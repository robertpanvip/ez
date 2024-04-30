export const EMPTY_ARR = [];
export const slice = EMPTY_ARR.slice;
function genHash(content:string) {
    let hash = 0;

    if (content.length === 0) {
        return hash;
    }
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = (hash << 5) - hash + char; // 使用简单的混合函数
    }
    return hash.toString(16); // 返回十六进制表示的哈希值
}

export function getStackKey() {
    try {
        throw new Error();
    } catch (e: any) {
        const stackKey = e.stack.replace(/\\n/g, '-').trim()
        return genHash(`${genHash(stackKey)}`);
    }
}