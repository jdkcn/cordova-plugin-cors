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

type HTTPMethod = 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'TRACE';

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

var readyState = Symbol();
Object.defineProperty(XMLHttpRequest, 'readyState', {
    get: function() {
        return this[readyState];
    }
});

XMLHttpRequest.prototype['makeAbsolute'] = function (relativeUrl: string) {
    var anchor = document.createElement('a');
    anchor.href = relativeUrl;
    return anchor.href;
};

XMLHttpRequest.prototype.setRequestHeader = function (header: string, value?: string | number | boolean) {
    this.requestHeaders = this.requestHeaders || {};
    if (value) {
        this.requestHeaders[header] = value;
    }
    else {
        delete this.requestHeaders[header];
    }
};

XMLHttpRequest.prototype.open = function (method: HTTPMethod, path: string) {
    const _this: XMLHttpRequest = this;
    if (_this.readyState !== XMLHttpRequest.UNSENT) {
        throw 'XHR is already opened';
    }
    _this[readyState] = XMLHttpRequest.OPENED;
    _this['path'] = this.makeAbsolute(path);
    _this['method'] = method;
}

XMLHttpRequest.prototype.send = function (data: any) {
    var _this: XMLHttpRequest = this;
    if (this.readyState !== XMLHttpRequest.OPENED) {
        if (this.readyState === XMLHttpRequest.UNSENT) {
            throw new DOMException('State is UNSENT but it should be OPENED.', 'InvalidStateError');
        }
        throw new DOMException('The object is in an invalid state (should be OPENED).', 'InvalidStateError');
    }
    this.zone = typeof Zone !== 'undefined' ? Zone.current : undefined;
    this.readyState = this.LOADING;
    exec(function (response) {
        _this.status = response.status;
        _this.statusText = response.statusText;
        _this.responseText = response.responseText;
        _this['responseHeaders'] = response.responseHeaders;
        _this['allResponseHeaders'] = response.allResponseHeaders;
        _this[readyState] = XMLHttpRequest.DONE;
        _this.dispatchEvent(new Event('load', {
            bubbles: false,
            cancelable: false
        }));
        _this.dispatchEvent(new Event('loadend', {
            bubbles: false,
            cancelable: false
        }));
    }, function (error) {
        _this.dispatchEvent(new Event('error', {
            bubbles: true,
            cancelable: false
        }))
        _this[readyState] = _this.DONE;
    }, 'CORS', 'send', [this.method, this.path, this.requestHeaders, data]);
};

module.exports = XMLHttpRequest;
