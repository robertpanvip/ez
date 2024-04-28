export class BusEvent<T> extends CustomEvent<T> {
    constructor(type: string, eventInitDict?: CustomEventInit<T>) {
        super(type,eventInitDict);
    }
}

class BusEventTarget extends EventTarget {
    constructor() {
        super();
    }

    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean) {
        super.addEventListener(type, callback, options);
    }

    removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean) {
        super.removeEventListener(type, callback, options);
    }

    dispatchEvent(event: Event): boolean {
        return super.dispatchEvent(event);
    }
}
const target = new BusEventTarget()

export default target;
