var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var exec = require('cordova/exec');
var XHR = /** @class */ (function (_super) {
    __extends(XHR, _super);
    function XHR() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = 0;
        _this.statusText = null;
        _this.responseText = null;
        _this.responseXML = null;
        // TODO: Support these.
        _this.timeout = 60;
        _this.withCredentials = false;
        _this.responseType = null;
        _this.responseURL = null;
        _this.upload = null;
        _this.msCachingEnabled = function () { return false; };
        _this.msCaching = null;
        _this.onprogress = null;
        _this.onload = null;
        _this.onloadstart = null;
        _this.onloadend = null;
        _this.onreadystatechange = null;
        _this.onerror = null;
        _this.onabort = null;
        _this.ontimeout = null;
        _this._readyState = XMLHttpRequest.UNSENT;
        _this.path = null;
        _this.method = null;
        _this.requestHeaders = {};
        _this.responseHeaders = {};
        _this.allResponseHeaders = null;
        _this.listeners = {
            progress: [],
            load: [],
            loadstart: [],
            loadend: [],
            readystatechange: [],
            error: [],
            abort: [],
            timeout: []
        };
        return _this;
    }
    Object.defineProperty(XHR.prototype, "response", {
        get: function () {
            return this.responseText;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XHR.prototype, "readyState", {
        // ---
        get: function () {
            return this._readyState;
        },
        set: function (readyState) {
            this._readyState = readyState;
            this.dispatchEvent(new Event('readystatechange', {
                bubbles: false,
                cancelable: false
            }));
        },
        enumerable: true,
        configurable: true
    });
    XHR.prototype.open = function (method, path) {
        if (this.readyState !== XMLHttpRequest.UNSENT) {
            throw 'XHR is already opened';
        }
        this.readyState = XMLHttpRequest.OPENED;
        this.path = this.makeAbsolute(path);
        this.method = method;
    };
    XHR.prototype.send = function (data) {
        var _this = this;
        if (this.readyState !== XMLHttpRequest.OPENED) {
            if (this.readyState === XMLHttpRequest.UNSENT) {
                throw new DOMException('State is UNSENT but it should be OPENED.', 'InvalidStateError');
            }
            throw new DOMException('The object is in an invalid state (should be OPENED).', 'InvalidStateError');
        }
        this.zone = typeof Zone !== 'undefined' ? Zone.current : undefined;
        this.readyState = XMLHttpRequest.LOADING;
        exec(function (response) {
            _this.status = response.status;
            _this.statusText = response.statusText;
            _this.responseText = response.responseText;
            _this.responseHeaders = response.responseHeaders;
            _this.allResponseHeaders = response.allResponseHeaders;
            _this.readyState = XMLHttpRequest.DONE;
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
            }));
            _this.readyState = XMLHttpRequest.DONE;
        }, 'CORS', 'send', [this.method, this.path, this.requestHeaders, data]);
    };
    XHR.prototype.abort = function () {
        // Ignored.
    };
    XHR.prototype.overrideMimeType = function (mimeType) {
        throw 'Not supported';
    };
    XHR.prototype.setRequestHeader = function (header, value) {
        if (value) {
            this.requestHeaders[header] = value;
        }
        else {
            delete this.requestHeaders[header];
        }
    };
    XHR.prototype.getResponseHeader = function (header) {
        return this.responseHeaders[header];
    };
    XHR.prototype.getAllResponseHeaders = function () {
        return this.allResponseHeaders;
    };
    XHR.prototype.makeAbsolute = function (relativeUrl) {
        var anchor = document.createElement('a');
        anchor.href = relativeUrl;
        return anchor.href;
    };
    return XHR;
}(XMLHttpRequest));
module.exports = XHR;
