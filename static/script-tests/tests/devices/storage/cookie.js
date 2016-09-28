/**
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

// Unit tests
require(
    ['antie/devices/storage/cookie'],
    function (Cookie) {
        describe('antie.devices.storage.Cookie', function () {
            describe('Created by getInstance', function () {
                it('Can retrieve saved cookies', function () {
                    var savedObject = {
                        some: 'things'
                    };
                    document.cookie = 'somenamespace=' + encodeURIComponent(JSON.stringify(savedObject));
                    var cookie = Cookie.getInstance('somenamespace', {});
                    expect(cookie.getItem('some')).toEqual('things');
                });

                it('Will always be the same for the namespace', function () {
                    var cookie = Cookie.getInstance('somenamespace2', {});
                    cookie.setItem('myKey', 'myValue');
                    var cookie2 = Cookie.getInstance('somenamespace2', {});

                    expect(cookie2.getItem('myKey')).toEqual('myValue');
                });

                it('Can hold JSON', function () {
                    var cookie = Cookie.getInstance('somenamespace2', {});
                    var objectToPersist = {
                        some: 'random',
                        json: {
                            look: 'it is',
                            nested: 123124
                        }
                    };
                    cookie.setItem('myKey', objectToPersist);
                    var cookie2 = Cookie.getInstance('somenamespace2', {});

                    expect(cookie2.getItem('myKey')).toEqual(objectToPersist);
                });

                it('Has isolated namespaces', function () {
                    var cookie = Cookie.getInstance('test1', {});
                    cookie.setItem('myKey', 'myValue');
                    var cookie2 = Cookie.getInstance('test2', {});
                    cookie2.setItem('myKey', 'something different');

                    expect(cookie.getItem('myKey')).toEqual('myValue');
                    expect(cookie2.getItem('myKey')).toEqual('something different');
                });

                it('Can remove items from a namespace', function () {
                    var cookie = Cookie.getInstance('test1', {});
                    cookie.setItem('myKey', 'myValue');
                    var cookie2 = Cookie.getInstance('test2', {});
                    cookie2.setItem('myKey', 'something different');
                    var cookie3 = Cookie.getInstance('test1', {});

                    cookie3.removeItem('myKey');

                    expect(cookie.getItem('myKey')).toEqual(undefined);
                    expect(cookie2.getItem('myKey')).toEqual('something different');
                });
            });
        });
    }
);

// Integration tests
(function() {
    this.CookieStorageProviderTest = AsyncTestCase('Storage_Cookie_Integration');
    var config = {
        'modules':{
            'base':'antie/devices/browserdevice',
            'modifiers':[
                'antie/devices/data/json2'
            ],
            'mods': {
                'PersistantStorage': 'antie/devices/storage/cookie'
            }
        },
        'input':{
            'map':{}
        },
        'layouts':[
            {
                'width':960,
                'height':540,
                'module':'fixtures/layouts/default',
                'classes':['browserdevice540p']
            }
        ],
        'deviceConfigurationKey':'devices-html5-1'
    };

    this.CookieStorageProviderTest.prototype.testCookieIntegration = function(queue) {
        expectAsserts(1);

        queuedApplicationInit(queue, 'lib/mockapplication', ['antie/storageprovider'], function(application, StorageProvider) {
            var obj = {
                'hello': ['house','street','town','region','country','continent','world','solar system','galaxy', 'universe']
            };
            var str = 'test1=' + encodeURIComponent(application.getDevice().encodeJson(obj));

            var storage = application.getDevice().getStorage(StorageProvider.STORAGE_TYPE_PERSISTENT, 'test1');
            storage.setItem('hello', obj.hello);

            assertMatch(new RegExp(str), document.cookie);

        }, config);
    };

    onDeviceTestConfigValidation.removeTestsForIncompatibleDevices(['antie/devices/storage/cookie'], this.CookieStorageProviderTest);
})();
