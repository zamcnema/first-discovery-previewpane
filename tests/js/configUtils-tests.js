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

require("../../src/js/configUtils.js");

fluid.defaults("gpii.tests.resolvers.env", {
    gradeNames: ["fluid.component"],
    members: {
        envVars: "{gpii.resolvers.env}.vars"
    }
});

jqUnit.test("gpii.resolvers.env", function () {
    var environment = gpii.tests.resolvers.env();
    jqUnit.assertDeepEq("process.env and the component's vars property should be equivalent", process.env, environment.envVars);
});

fluid.defaults("gpii.tests.firstDiscovery.schema", {
    gradeNames: ["gpii.schema"],
    schema: {
        "required": ["toValidate"],
        "properties": {
            "toValidate": {
                "type": "string"
            }
        }
    }
});

jqUnit.test("gpii.tests.firstDiscovery.schema - valid", function () {
    jqUnit.expect(1);
    gpii.tests.firstDiscovery.schema({
        toValidate: "valid",
        listeners: {
            "validated": {
                listener: "jqUnit.assert",
                args: ["The schema should have validated and triggered the validated event"]
            }
        }
    });
});

jqUnit.test("gpii.tests.firstDiscovery.schema - invalid", function () {
    jqUnit.expectFrameworkDiagnostic("The schema should have failed validation and thrown an error", gpii.tests.firstDiscovery.schema, "data.toValidate is a required property");
});
