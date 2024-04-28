export const EMPTY_ARR = [];
export const slice = EMPTY_ARR.slice;
export function getPositionKey() {
    try {
        throw new Error();
    } catch (e: any) {
        return e.stack.split('\n')[2].trim();
    }
}