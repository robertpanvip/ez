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

function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function generateUniqueRandomString(existingStrings: Set<string>): string {
    let randomString = generateRandomString(6);
    while (existingStrings.has(randomString)) {
        randomString = generateRandomString(6);
    }
    return randomString;
}

// ：生成一个不重复的 6 位随机字符串
export function generateKey(): string {
    const existingStrings = new Set<string>();
    let randomString = '';
    while (existingStrings.size < 1) {
        randomString = generateUniqueRandomString(existingStrings);
        existingStrings.add(randomString);
    }
    return randomString;
}
