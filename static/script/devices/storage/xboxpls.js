/**
 * @preserve Copyright (c) 2015 British Broadcasting Corporation. All rights reserved.
 * @license See https://github.com/fmtvp/tal/blob/master/LICENSE for full licence
 */

define(
    'antie/devices/storage/xboxpls',
    [
        'antie/devices/browserdevice',
        'antie/storageprovider'
    ],
    function(Device, StorageProvider) {
        'use strict';

        return StorageProvider.extend({
            init: function() {
                /* global Windows: true */
                this._storage = Windows.Storage.ApplicationData.current.localSettings.values;

            },

            getItem: function (key) {
                if (this._storage.hasKey(key)) {
                    var value = this._storage.lookup(key);
                    var jsonifiedValue = Device.prototype.decodeJson(value);

                    if (jsonifiedValue === null) {
                        return undefined;
                    }

                    return jsonifiedValue;
                }
                return undefined;
            },

            setItem: function (key, value) {
                var stringifiedValue = Device.prototype.encodeJson(value);
                this._storage.insert(key, stringifiedValue);
            },

            removeItem: function(key) {
                this._storage.insert(key, null);
            },

            clear: function() {
                this._storage.clear();
            }
        });
     //   return XboxStorage;
    }
);
