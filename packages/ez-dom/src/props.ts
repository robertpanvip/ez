import {IS_NON_DIMENSIONAL} from 'ez'
import {isValidSignal} from "ez/src/create-element.ts";

let eventClock = 0;

function setStyle(style: any, key: string, value: any) {
    if (key[0] === '-') {
        style.setProperty(key, value == null ? '' : value);
    } else if (value == null) {
        style[key] = '';
    } else if (typeof value != 'number' || IS_NON_DIMENSIONAL.test(key)) {
        style[key] = value;
    } else {
        style[key] = value + 'px';
    }
}

/**
 * Set a property value on a DOM node
 * @param {PreactElement} dom The DOM node to modify
 * @param {string} name The name of the property to set
 * @param {*} value The value to set the property to
 * @param {*} oldValue The old value the property had
 * @param {boolean} isSvg Whether or not this DOM node is an SVG node or not
 */
export function setProperty(dom: any, name: string, value: any, oldValue: any, isSvg: boolean) {
    if (isValidSignal(value)) {
        value.subscribe?.((val: any) => {
            setProperty(dom, name, val, undefined, false)
        });
        return;
    }

    let useCapture;
    o: if (name === 'style') {
        if (typeof value == 'string') {
            dom.style.cssText = value;
        } else {
            if (typeof oldValue == 'string') {
                dom.style.cssText = oldValue = '';
            }

            if (oldValue) {
                for (name in oldValue) {
                    if (!(value && name in value)) {
                        setStyle(dom.style, name, '');
                    }
                }
            }

            if (value) {
                for (name in value) {
                    if (!oldValue || value[name] !== oldValue[name]) {
                        setStyle(dom.style, name, value[name]);
                    }
                }
            }
        }
    }
    // Benchmark for comparison: https://esbench.com/bench/574c954bdb965b9a00965ac6
    else if (name[0] === 'o' && name[1] === 'n') {

        useCapture =
            name !== (name = name.replace(/(PointerCapture)$|Capture$/i, '$1'));

        // Infer correct casing for DOM built-in events:
        if (
            name.toLowerCase() in dom ||
            name === 'onFocusOut' ||
            name === 'onFocusIn'
        )
            name = name.toLowerCase().slice(2);
        else name = name.slice(2);
        if (!dom._listeners) dom._listeners = {};
        dom._listeners[name + useCapture] = value;

        if (value) {
            if (!oldValue) {
                value._attached = eventClock;
                dom.addEventListener(
                    name,
                    useCapture ? eventProxyCapture : eventProxy,
                    useCapture
                );
            } else {
                value._attached = oldValue._attached;
            }
        } else {
            dom.removeEventListener(
                name,
                useCapture ? eventProxyCapture : eventProxy,
                useCapture
            );
        }
    } else {
        if (isSvg) {
            // Normalize incorrect prop usage for SVG:
            // - xlink:href / xlinkHref --> href (xlink:href was removed from SVG and isn't needed)
            // - className --> class
            name = name.replace(/xlink(H|:h)/, 'h').replace(/sName$/, 's');
        } else if (
            name != 'width' &&
            name != 'height' &&
            name != 'href' &&
            name != 'list' &&
            name != 'form' &&
            // Default value in browsers is `-1` and an empty string is
            // cast to `0` instead
            name != 'tabIndex' &&
            name != 'download' &&
            name != 'rowSpan' &&
            name != 'colSpan' &&
            name != 'role' &&
            name in dom
        ) {
            try {
                dom[name] = value == null ? '' : value;
                // labelled break is 1b smaller here than a return statement (sorry)
                break o;
            } catch (e) { /* empty */
            }
        }

        // aria- and data- attributes have no boolean representation.
        // A `false` value is different from the attribute not being
        // present, so we can't remove it. For non-boolean aria
        // attributes we could treat false as a removal, but the
        // amount of exceptions would cost too many bytes. On top of
        // that other frameworks generally stringify `false`.

        if (typeof value == 'function') {
            // never serialize functions as attribute values
        } else if (value != null && (value !== false || name[4] === '-')) {
            dom.setAttribute(name, value);
        } else {
            dom.removeAttribute(name);
        }
    }
}


/**
 * Create an event proxy function.
 * @param {boolean} useCapture Is the event handler for the capture phase.
 * @private
 */
function createEventProxy(useCapture: boolean) {
    /**
     * Proxy an event to hooked event handlers
     * @param {PreactEvent} e The event object from the browser
     * @private
     */
    return function (e: any) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (this._listeners) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const eventHandler = this._listeners[e.type + useCapture];
            if (e._dispatched == null) {
                e._dispatched = eventClock++;

                // When `e._dispatched` is smaller than the time when the targeted event
                // handler was attached we know we have bubbled up to an element that was added
                // during patching the DOM.
            } else if (e._dispatched < eventHandler._attached) {
                return;
            }
            return eventHandler(e);
        }
    };
}

const eventProxy = createEventProxy(false);
const eventProxyCapture = createEventProxy(true);