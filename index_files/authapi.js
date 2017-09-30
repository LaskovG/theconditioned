/*global window, document, $, Promise*/

(function () {
    'use strict';

    window.Ya = window.Ya || {};
    window.Ya.Kinopoisk = window.Ya.Kinopoisk || {};

    var AUTH_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 60; // 60 days
    var COOKIE_NAME = 'user-source';
    var COOKIE_DOMAIN = '.kinopoisk.ru';

    var apiInited = false;
    var deferredOpenArgs = [];
    var resolve;

    var config = window.Ya.Kinopoisk.auth || {};
    var useProxy = config.useProxy || false;
    var retPath = encodeURIComponent(document.location.href);

    var win;
    var html;
    var body;
    var htmlInitialOverlflow;
    var lastPromise;

    function createPromise() {
        var promise;

        if ('jQuery' in window) {
            var defer = $.Deferred();

            resolve = defer.resolve.bind(defer);
            promise = defer.promise();
        } else {
            promise = new Promise(function (_resolve) {
                resolve = _resolve;
            });
        }

        lastPromise = promise;

        return promise;
    }

    // @link http://stackoverflow.com/questions/9038625/detect-if-device-is-ios
    var isIos = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;

    document.addEventListener('DOMContentLoaded', function () {
        body = document.body;
        win = window;
        html = document.documentElement;
        htmlInitialOverlflow = html.style.overflow;

        if (isIos) {
            body.classList.add('kp2-authapi_ios');
        }

        var stylesLink = document.createElement('link');
        stylesLink.setAttribute('rel', 'stylesheet');
        stylesLink.setAttribute('href', '//' + getBaseHost() + '/cinemaplayer/authapi.css');

        body.appendChild(stylesLink);

        apiInited = true;
        if (deferredOpenArgs.length) {
            open.apply(this, deferredOpenArgs);
        }
    });

    var overlay;
    var iframe;
    var iframeWrapper;
    var paranja;
    var isOpen = false;
    var openPopupType;

    var callbacks = {};

    function getBaseHost() {
        return window.Ya.Kinopoisk.basehost || 'plus.kinopoisk.ru';
    }

    function lockScroll() {
        // Touch devices have a specific scroll-locking,
        // so, currently they should have own implementation of it
        if (isTouchTheme()) {
            return;
        }

        html.style.overflow = 'hidden';
    }

    function unlockScroll() {
        if (isTouchTheme()) {
            return;
        }

        html.style.overflow = htmlInitialOverlflow;
    }

    function getMarginTop(height) {
        var marginTop = -(height / 2);
        var winHalfHeight = win.clientHeight / 2;
        if ((winHalfHeight + marginTop) < 0) {
            marginTop = -winHalfHeight;
        }
        return marginTop;
    }

    function open(type, query, deferred) {
        var promise;

        if (deferred) {
            promise = lastPromise;
        } else {
            promise = createPromise();
        }

        if (isOpen && type === openPopupType) {
            return promise;
        }

        if (!apiInited) {
            deferredOpenArgs = [type, query, true];
            return promise;
        }

        lockScroll();
        win.addEventListener('message', onMessage);
        isOpen = true;
        insertOverlay(type, query);
        openPopupType = type;

        return promise;
    }

    function close() {
        if (!isOpen) {
            return;
        }

        onClose();
    }

    function resize(height) {
        if (isTouchTheme()) {
            iframeWrapper.style.minHeight = height + 'px';
            return;
        }

        iframeWrapper.style.height = height + 'px';
        iframeWrapper.style.marginTop = getMarginTop(height) + 'px';
    }

    function onMessage(evt) {
        if (evt.data.type !== 'Ya.Kinopoisk.auth') {
            return;
        }

        var request = evt.data.request;

        switch (request.type) {
            case 'init':
                iframeWrapper.classList.add('kp2-authapi-iframe-wrapper_inited');
                resize(request.height);
                break;

            case 'resize':
                resize(request.height);
                break;

            case 'resolve':
                resolve(request.data);
                var userSource = request.data['logged-in'];

                if (userSource) {
                    var source = userSource[0] === 'native' ? userSource[0] : userSource[1];

                    document.cookie = [
                        COOKIE_NAME + '=' + source,
                        'domain=' + COOKIE_DOMAIN,
                        'max-age=' + AUTH_COOKIE_MAX_AGE
                    ].join(';');
                }
                break;

            case 'register':
                register();
                break;

            case 'close':
                close();
                break;

            case 'error':
                emit('error', request.data);
                break;

            case 'httpError':
                emit('error', request.data);
                close();
                break;
        }
    }

    function onOverlayClick() {
        close();
    }

    function onClose() {
        emit('close');
        win.removeEventListener('message', onMessage);
        overlay.removeEventListener('click', onOverlayClick);
        overlay.classList.add('kp2-authapi-overlay_hidden');
        paranja.removeEventListener('click', onOverlayClick);
        paranja.classList.add('kp2-authapi-paranja_hidden');
        isOpen = false;
        openPopupType = null;
        unlockScroll();
        setTimeout(function () {
            paranja.parentNode.removeChild(paranja);
            paranja = null;
            overlay.parentNode.removeChild(overlay);
            overlay = null;
            iframe = null;
        }, 300);
    }

    function insertOverlay(type, query) {
        overlay = generateOverlay();

        if (isIos && !isTouchTheme()) {
            overlay.style.top = window.scrollY + 'px';
        }

        iframe = generateIframe(type, query);
        iframeWrapper = generateIframeWrap();
        paranja = generateParanja();
        overlay.appendChild(iframeWrapper);
        iframeWrapper.appendChild(iframe);
        body.appendChild(overlay);
        body.appendChild(paranja);

        setTimeout(function () {
            iframeWrapper.classList.add('kp2-authapi-iframe-wrapper_inserted');
        });
    }

    function isTouchTheme() {
        return window.Ya.Kinopoisk.auth.theme === 'touch';
    }

    function generateIframeWrap() {
        var classNames = ['kp2-authapi-iframe-wrapper'];

        if (isTouchTheme()) {
            classNames.push('kp2-authapi-iframe-wrapper_theme_touch');
        }

        var iframeWrapper = document.createElement('div');
        iframeWrapper.classList.add.apply(iframeWrapper.classList, classNames);

        return iframeWrapper;
    }

    function generateIframe(type, query) {
        query = query || {};
        query.retPath = document.location.href;

        if (isTouchTheme()) {
            query.ref = 'touch';
        }

        var querystring = Object.keys(query).reduce(function (memo, key) {
            memo.push(key + '=' + encodeURIComponent(query[key]));
            return memo;
        }, []).join('&');
        var className = 'kp2-authapi-iframe';

        var src = (useProxy ? '' : '//' + getBaseHost()) + '/embed/' + type + '/?' + querystring;
        iframe = document.createElement('iframe');
        iframe.classList.add(className);
        iframe.setAttribute('src', src);
        iframe.setAttribute('name', 'kp2-authapi-iframe');

        return iframe;
    }

    function generateParanja() {
        paranja = document.createElement('div');
        paranja.classList.add('kp2-authapi-paranja');
        if (isTouchTheme()) {
            paranja.classList.add('kp2-authapi-paranja_theme_touch');
        }
        paranja.addEventListener('click', onOverlayClick);
        return paranja;
    }

    function generateOverlay() {
        overlay = document.createElement('div');
        overlay.classList.add('kp2-authapi-overlay');
        overlay.addEventListener('click', onOverlayClick);
        return overlay;
    }

    function register() {
        var url = '//' + getBaseHost() + '/registration/?retPath=' + retPath;

        if (isTouchTheme()) {
            url += '&ref=touch';
        }

        document.location.href = url;
    }

    window.Ya.Kinopoisk.auth = {
        login: function () {
            return open('login');
        },

        changePassword: function () {
            return open('password');
        },

        changePasswordUnauth: function (userId, token) {
            return open('password-unauth', {
                userId: userId,
                token: token
            });
        },

        changeEmail: function () {
            return open('email');
        },

        changeLogin: function () {
            return open('change-login');
        },

        restorePassword: function () {
            return open('restore-password');
        },

        deleteAccount: function () {
            return open('delete-account');
        },

        createLoginPassword: function () {
            return open('create-login-password');
        },

        close: close,

        register: register,

        on: function (eventName, callback) {
            getCallbacks(eventName).push(callback);
        },

        un: function (eventName, callback) {
            var callbacks = getCallbacks(eventName);
            var index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    };

    function emit(eventName, data) {
        getCallbacks(eventName).forEach(function (callback) {
            callback(data);
        });
    }

    function getCallbacks(eventName) {
        callbacks[eventName] = callbacks[eventName] || [];
        return callbacks[eventName];
    }
})();

