function runTest(config) {
    promise_test(function (test) {
        var initDataType;
        var initData;
        var keySystem = config.keysystem;
        var invalidLicense = new Uint8Array([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77]);
        var messageEventFired = false;
        return navigator.requestMediaKeySystemAccess(keySystem, getSimpleConfiguration()).then(function (access) {
            initDataType = access.getConfiguration().initDataTypes[0];
            initData = getInitData(initDataType);
            return access.createMediaKeys();
        }).then(function (mediaKeys) {
            var keySession = mediaKeys.createSession();
            var eventWatcher = new EventWatcher(test, keySession, ['message']);
            var promise = eventWatcher.wait_for('message');
            keySession.generateRequest(initDataType, initData);
            return promise;
        }).then(function (messageEvent) {
            messageEventFired = true;
            return messageEvent.target.update(invalidLicense);
        }).then(function (messageEvent) {
            assert_unreached('Error: update() succeeded unexpectedly.');
        }).catch(function (error) {
            if(messageEventFired) {
                assert_equals(error.name, 'InvalidAccessError');
            }
            else {
                forceTestFailureFromPromise(test, error);
            }
        });
    }, 'Invalid Key License.');
}