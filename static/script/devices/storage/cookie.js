/**
 * @fileOverview Requirejs modifier for default XHR-based network operations
 *
 * @preserve Copyright (c) 2013 British Broadcasting Corporation
 * (http://www.bbc.co.uk) and TAL Contributors (1)
 *
 * (1) TAL Contributors are listed in the AUTHORS file and at
 *     https://github.com/fmtvp/TAL/AUTHORS - please extend this file,
 *     not this notice.
 *
 * @license Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * All rights reserved
 * Please contact us for an alternative licence
 */

define(
    'antie/devices/storage/cookie',
    [
        'antie/devices/browserdevice',
        'antie/storageprovider'
    ],
    function(Device, StorageProvider) {
        'use strict';

        // http://www.quirksmode.org/js/cookies.html
        var namespaces = {};

        var default_days = 366;
        var pathParts = document.location.pathname.split('/');
        pathParts.pop();
        var path = pathParts.join('/') + '/';

        function createCookie(namespace, value, days, opts) {
            value = encodeURIComponent(value);
            days = days || default_days;
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

            var cookiePath = opts.path || path;

            var cookieDataArray = [
                namespace + '=' + value,
                'expires=' + date.toGMTString(),
                'path=' + (opts.isPathless ? '/' : cookiePath)
            ];
            if (opts.domain){
                cookieDataArray.push('domain='+opts.domain);
            }
            document.cookie = cookieDataArray.join('; ');
        }

        function readCookie(namespace) {
            var nameEQ = namespace + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                    return decodeURIComponent(c.substring(nameEQ.length, c.length));
                }
            }
            return null;
        }

        function eraseCookie(namespace, opts) {
            createCookie(namespace, '', -1, opts);
        }

        /**
         * Class for persistently storing date in cookies
         * @name antie.devices.storage.CookieStorage
         * @class
         * @extends antie.StorageProvider
         * @param {String} namespace The cookie name to be used for this cookie storage object
         * @param {Object} [opts]
         * @param {String} [opts.domain] The domain value of the cookie, if not provided this is not set on the cookie
         * @param {Boolean} [opts.isPathless] If <code>true</code> sets the path to '/' else retrieves the path from the location
         * @param {String} [opt.path] The path to save the cookie against
         */
        var CookieStorage = StorageProvider.extend(/** @lends antie.devices.storage.CookieStorage.prototype */{
            /**
             * @constructor
             * @ignore
             */
            init: function(namespace, opts) {
                this._super();
                this._namespace = namespace;
                this._opts = opts || {};

                var cookie = readCookie(namespace);

                if(cookie) {
                    this._valueCache = Device.prototype.decodeJson(cookie);
                    if(this._valueCache) {
                        this._save();
                    } else {
                        this._valueCache = {};
                    }
                }
            },
            setItem: function(key, value) {
                this._super(key, value);
                this._save();
            },
            removeItem: function(key) {
                this._super(key);
                this._save();
            },
            clear: function() {
                this._super();
                this._save();

                // delete it from the stored namespaces
                // so it will be reloaded the next time
                // we get it
                delete namespaces[this._namespace];
            },
            _isEmpty: function() {
                var prop;
                for(prop in this._valueCache) {
                    if(this._valueCache.hasOwnProperty(prop)) {
                        return false;
                    }
                }
                return true;
            },
            _save: function() {
                if(this._isEmpty()) {
                    eraseCookie(this._namespace, this._opts);
                } else {
                    var json = Device.prototype.encodeJson(this._valueCache);
                    createCookie(this._namespace, json, undefined, this._opts);
                }
            }
        });

        CookieStorage.getInstance = function (namespace, opts) {
            if(!namespaces[namespace]) {
                namespaces[namespace] = new CookieStorage(namespace, opts);
            }
            return namespaces[namespace];
        };

        return CookieStorage;
    }
);
