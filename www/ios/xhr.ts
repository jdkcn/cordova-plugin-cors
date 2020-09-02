declare var require: (module: string) => any;
declare var module: {
    exports: any;
};
interface Zone {
    run<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;
}
interface ZoneType {
    current: Zone;
}
declare const Zone: ZoneType;

const exec: (
    onsuccess: (value: any) => void,
    onerror: (error: any) => void,
    plugin: string,
    func: string,
    args: any[]) => void = require('cordova/exec');

interface XHRListeners {
    progress: ((event: ProgressEvent) => void)[];
    load: ((event: Event) => void)[];
    loadstart: ((event: Event) => void)[];
    loadend: ((event: ProgressEvent) => void)[];
    readystatechange: ((event: Event) => void)[];
    error: ((event: ErrorEvent) => void)[];
    abort: ((event: Event) => void)[];
    timeout: ((event: ProgressEvent) => void)[];
}

interface XHRResponse {
    status: number;
    statusText: string;
    responseText: string;
    responseHeaders: {[header: string]: string};
    allResponseHeaders: string;
}

class XHR extends XMLHttpRequest {
    status = 0;
    statusText: string = null;
    get response(): any {
        return this.responseText;
    }
    responseText: string = null;
    responseXML: Document = null;

    // TODO: Support these.
    timeout = 60;
    withCredentials = false;
    responseType: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' = null;
    responseURL: string = null;
    upload: XMLHttpRequestUpload = null;
    msCachingEnabled = () => false;
    msCaching: string = null;
    // ---

    get readyState(): number {
        return this._readyState;
    }
    set readyState(readyState: number) {
        this._readyState = readyState;
        this.dispatchEvent(new Event('readystatechange', {
            bubbles: false,
            cancelable: false
        }));
    }

    onprogress: (event: ProgressEvent) => void = null;
    onload: (event: Event) => void = null;
    onloadstart: (event: Event) => void = null;
    onloadend: (event: ProgressEvent) => void = null;
    onreadystatechange: (event: Event) => void = null;
    onerror: (event: Event) => void = null;
    onabort: (event: Event) => void = null;
    ontimeout: (event: ProgressEvent) => void = null;

    private _readyState = XMLHttpRequest.UNSENT;
    private path: string = null;
    private method: 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'TRACE' = null;
    private requestHeaders: {[header: string]: string} = {};
    private responseHeaders: {[header: string]: string} = {};
    private allResponseHeaders: string = null;

    private listeners: { [key: string]: ((event: Event | ProgressEvent) => void)[] } = {
        progress: [],
        load: [],
        loadstart: [],
        loadend: [],
        readystatechange: [],
        error: [],
        abort: [],
        timeout: []
    };

    private zone: Zone;

    open(method: 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'TRACE', path: string) {
        if (this.readyState !== XMLHttpRequest.UNSENT) {
            throw 'XHR is already opened';
        }
        this.readyState = XMLHttpRequest.OPENED;
        this.path = this.makeAbsolute(path);
        this.method = method;
    }

    send(data?: Document | string | any) {
        if (this.readyState !== XMLHttpRequest.OPENED) {
            if (this.readyState === XMLHttpRequest.UNSENT) {
                throw new DOMException('State is UNSENT but it should be OPENED.', 'InvalidStateError');
            }
            throw new DOMException('The object is in an invalid state (should be OPENED).', 'InvalidStateError');
        }
        this.zone = typeof Zone !== 'undefined' ? Zone.current : undefined;
        this.readyState = XMLHttpRequest.LOADING;

        exec((response: XHRResponse) => {
            this.status = response.status;
            this.statusText = response.statusText;
            this.responseText = response.responseText;
            this.responseHeaders = response.responseHeaders;
            this.allResponseHeaders = response.allResponseHeaders;
            this.readyState = XMLHttpRequest.DONE;

            this.dispatchEvent(new Event('load', {
                bubbles: false,
                cancelable: false
            }));
            this.dispatchEvent(new Event('loadend', {
                bubbles: false,
                cancelable: false
            }));
        }, (error) => {
            this.dispatchEvent(new Event('error', {
                bubbles: true,
                cancelable: false
            }));
            this.readyState = XMLHttpRequest.DONE;
        }, 'CORS', 'send', [this.method, this.path, this.requestHeaders, data]);
    }

    abort() {
        // Ignored.
    }

    overrideMimeType(mimeType: string) {
        throw 'Not supported';
    }

    setRequestHeader(header: string, value?: string) {
        if (value) {
            this.requestHeaders[header] = value;
        } else {
            delete this.requestHeaders[header];
        }
    }

    getResponseHeader(header: string): string {
        return this.responseHeaders[header];
    }

    getAllResponseHeaders(): string {
        return this.allResponseHeaders;
    }

    private makeAbsolute(relativeUrl: string): string {
        var anchor = document.createElement('a');
        anchor.href = relativeUrl;
        return anchor.href;
    }
}

module.exports = XHR;
