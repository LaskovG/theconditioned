'use strict';

/* global window, document */

(function () {
    var LOCAL_CONNECTION_FALLBACK_TIMEOUT = 1000;

    var POPUP_WIDTH = 920;
    var POPUP_HEIGHT = 460;

    var KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g;

    var localConnectionId = Math.random().toString().slice(2);

    // http://stackoverflow.com/a/950146
    function loadScript(url, callback) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        script.onreadystatechange = callback;
        script.onload = callback;

        // Fire the loading
        head.appendChild(script);
    }

    function when(asyncFns, callback) {
        var countdown = asyncFns.length;

        asyncFns.forEach(function (fn) {
            fn(function () {
                countdown--;
                if (countdown === 0) {
                    callback();
                }
            });
        });
    }

    function getPopupParams(width, height) {
        var left = Math.round((window.outerWidth - width - 30) / 2);
        var top = Math.round((window.outerHeight - height - 100) / 2);

        return 'location=1,menubar=0,resizable=0,scrollbars=0,status=0,toolbar=0' +
            ',width=' + width +
            ',height=' + height +
            ',top=' + (top > 0 ? top : 0) +
            ',left=' + (left > 0 ? left : 0);
    }

    function PlayerApi() {
        this._handlers = {};
    }

    /*
     * @param {String} url
     * @param {Object} [options]
     *   @param {Boolean} [options.autoplay]
     *   @param {Boolean} [options.from]
     */
    PlayerApi.prototype.open = function (url, options) {
        var link = document.createElement('a');

        link.href = url;

        var search = link.search.replace(/^\?/, '');
        var keyVals = search.split('&');
        var query = {};

        keyVals.forEach(function (keyVal) {
            keyVal = keyVal.split('=');
            query[decodeURIComponent(keyVal[0])] = decodeURIComponent(keyVal[1]);
        });

        var baseorigin;
        if (query.baseorigin) {
            baseorigin = query.baseorigin;
        } else {
            baseorigin = '//plus.kinopoisk.ru';
        }

        var fnsToWait = [
            loadScript.bind(null, baseorigin + '/cinemaplayer/local-connection.js'),
            function (callback) {
                setTimeout(function () {
                    callback();
                }, LOCAL_CONNECTION_FALLBACK_TIMEOUT);
            }
        ];

        if (!window.swfobject) {
            fnsToWait.push(
                loadScript.bind(null, '//yastatic.net/swfobject/2.2/swfobject.min.js')
            );
        }

        when(fnsToWait,
            function () {
                var lc = window.localConnection.getLocalConnection({
                    input: 'main-' + localConnectionId,
                    output: 'popup-' + localConnectionId,
                    baseorigin: baseorigin
                });

                lc.on('flashapi', function (data) {
                    var request = data.request;
                    playerApi._emit(toKebabCase(request.emit), request.data);
                });
                lc.inject();
            }
        );

        window.addEventListener('message', function (messageData) {
            var message = messageData.data;
            var request = message && message.request;

            if (request && request.event === 'init') {
                if (messageData.source && !messageData.source.closed) {
                    messageData.source.postMessage({
                        type: 'flashapi',
                        request: {
                            event: 'inited'
                        }
                    }, '*');
                }
                return;
            }

            if (message.type !== 'flashapi' || !request) {
                return;
            }

            playerApi._emit(toKebabCase(request.emit), request.data || null);
        }, false);

        if (options.autoplay) {
            query.autoplay = 1;
        }

        if (options.from) {
            query.from = options.from;
        }

        query.lcid = localConnectionId;

        // query to string
        var queryString = Object.keys(query).map(function (key) {
            var val = query[key];

            key = encodeURIComponent(key);

            if (val === undefined) {
                return key;
            } else {
                return key + '=' + encodeURIComponent(val);
            }
        }).join('&');

        // in IE property "pathname" come in without "/" at start of the string
        var path = (link.pathname.indexOf('/') === 0 ? '' : '/') + link.pathname;
        var popupUrl = link.protocol + '//' + link.hostname + path + '?' + queryString;

        window.open(
            popupUrl,
            '',
            getPopupParams(POPUP_WIDTH, POPUP_HEIGHT)
        );
    };

    PlayerApi.prototype._emit = function (eventName, data) {
        var handlers = this._getHandlers(eventName);

        handlers.forEach(function (handler) {
            handler({
                type: eventName,
                data: data
            });
        });
    };

    PlayerApi.prototype._getHandlers = function (eventName) {
        var handlers = this._handlers[eventName] || [];
        return handlers.concat(this._handlers['*'] || []);
    };

    PlayerApi.prototype.on = function (eventName, handler) {
        this._handlers[eventName] = this._handlers[eventName] || [];
        this._handlers[eventName].push(handler);
    };

    PlayerApi.prototype.off = function (eventName, handler) {
        var handlers = this._handlers[eventName] = this._handlers[eventName] || [];
        handlers[eventName].splice(handlers.indexOf(handler), 1);
    };

    if (!window.Ya) {
        window.Ya = {};
    }

    if (!window.Ya.Kinopoisk) {
        window.Ya.Kinopoisk = {};
    }

    var playerApi = window.Ya.Kinopoisk.player = new PlayerApi();

    // https://github.com/joakimbeng/kebab-case/blob/master/index.js
    function toKebabCase(str) {
        return str.replace(KEBAB_REGEX, function (match) {
            return '-' + match.toLowerCase();
        });
    }
})();
