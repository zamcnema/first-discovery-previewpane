/*
Copyright 2015 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/fluid-project/first-discovery-server/raw/master/LICENSE.txt
*/

"use strict";

var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");
var jqUnit = require("node-jqunit");
var kettle = require("kettle");
var nock = require("nock");
var querystring = require("querystring");

kettle.loadTestingSupport();

require("../../src/js/firstDiscoveryServer.js");
require("gpii-express/tests/js/lib/test-helpers.js");

fluid.defaults("gpii.tests.firstDiscovery.server", {
    gradeNames: ["gpii.firstDiscovery.server"],
    port: "{testEnvironment}.options.port",
    preferencesConfig: {
        "securityServer": {
            "port": "8081",
            "hostname": "http://localhost",
            "paths": {
                "token": "/access_token",
                "preferences": "/add-preferences?view=firstDiscovery"
            }
        },
        "authentication": {
            "grant_type": "client_credentials",
            "scope": "add_preferences",
            "client_id": "client_id_first_discovery",
            "client_secret": "client_secret_first_discovery"
        }
    },
    events: {
        onStarted: "{testEnvironment}.events.onStarted"
    }
});

gpii.tests.firstDiscovery.server.access = {
    access_token: "first_discovery_access_token",
    token_type: "Bearer"
};

gpii.tests.firstDiscovery.server.prefToSet = {
    "gpii_firstDiscovery_language": "en-US"
};

gpii.tests.firstDiscovery.server.prefResponse = {
    "userToken": "2288e676-d0bb-4d29-8131-7cff268ba012",
    "preferences": {
        "contexts": {
            "gpii-default": {
                "name": "Default preferences",
                "preferences": gpii.tests.firstDiscovery.server.prefToSet
            }
        }
    }
};

gpii.tests.firstDiscovery.server.removeQueryParam = function (path) {
    return path.split("?")[0];
};

gpii.tests.firstDiscovery.server.verifyJSONResponse = function (response, body, expectedResponse, expectedBody) {
    gpii.express.tests.helpers.isSaneResponse(jqUnit, response, body, 200);
    jqUnit.assertDeepEq("The body should be as expected...", expectedBody, JSON.parse(body));
};

gpii.tests.firstDiscovery.server.setupNock = function (config, access, prefs) {
    var security = nock(config.securityServer.hostname + ":" + config.securityServer.port);

    // log nock matches
    security.log(console.log);

    // mock POST requests to "/access_token"
    security.post(gpii.tests.firstDiscovery.server.removeQueryParam(config.securityServer.paths.token), querystring.stringify(config.authentication))
        .reply(200, access);

    // mock POST requests to "/add-preferences"
    security.post(gpii.tests.firstDiscovery.server.removeQueryParam(config.securityServer.paths.preferences), prefs, {
        reqHeaders: {
            Authorization: "Bearer first_discovery_access_token"
        }
    })
        .query({view: "firstDiscovery"})
        .reply(200, gpii.tests.firstDiscovery.server.prefResponse);
};

gpii.tests.firstDiscovery.server.teardownNock = function () {
    nock.isDone();
    nock.cleanAll();
    nock.restore();
};


fluid.defaults("gpii.tests.firstDiscovery.server.request", {
    gradeNames: ["kettle.test.request.http"],
    path:       "http://localhost/user?view=firstDiscovery",
    port:       "{testEnvironment}.options.port"
});


// TODO: Launch an instance of the security server to use for testing.
// This will likely require pulling in gpii universal and launching a
// security server with the appropriate configuration needed for testing.
// Currently this is not possible due to gpii universal and the first
// discovery server depend on incompatible versions of infusion.
// see: https://issues.gpii.net/browse/GPII-1318
// For the time being, nock is used to intercept the http requests, providing
// a simple mock solution for testing the requests to the security server.
fluid.defaults("gpii.tests.firstDiscovery.server.requestTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    events: {
        constructServer: null,
        onStarted: null
    },
    port: 8111,
    components: {
        express: {
            createOnEvent: "constructServer",
            type: "gpii.tests.firstDiscovery.server"
        },
        testCaseHolder: {
            type: "gpii.express.tests.caseHolder",
            options: {
                expected: {
                    response: 200,
                    body: gpii.tests.firstDiscovery.server.prefResponse
                },
                rawModules: [{
                    tests: [{
                        name: "Test ",
                        type: "test",
                        sequence: [{
                            funcName: "gpii.tests.firstDiscovery.server.setupNock",
                            args: ["{express}.options.preferencesConfig", gpii.tests.firstDiscovery.server.access, gpii.tests.firstDiscovery.server.prefResponse.preferences]
                        }, {
                            func: "{jsonRequest}.send",
                            args: [gpii.tests.firstDiscovery.server.prefToSet]
                        }, {
                            listener: "gpii.tests.firstDiscovery.server.verifyJSONResponse",
                            event:    "{jsonRequest}.events.onComplete",
                            args:     ["{jsonRequest}.nativeResponse", "{arguments}.0", "{testCaseHolder}.options.expected.response", "{testCaseHolder}.options.expected.body"]
                        }, {
                            funcName: "gpii.tests.firstDiscovery.server.teardownNock"
                        }]
                    }]
                }],
                components: {
                    jsonRequest: {
                        type: "gpii.tests.firstDiscovery.server.request",
                        options: {
                            method: "POST"
                        }
                    }
                }
            }
        }
    }
});

fluid.test.runTests([
    "gpii.tests.firstDiscovery.server.requestTests"
]);
