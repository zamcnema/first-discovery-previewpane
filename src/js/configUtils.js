/*
Copyright 2015 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/first-discovery-server/master/LICENSE.txt
*/

"use strict";

var fluid = require("infusion");
var ajv = require("ajv");
var gpii = fluid.registerNamespace("gpii");

/**
 * Exposes the environment variables available to the node process, to a
 * form that is accessible via the IoC system.
 */
fluid.defaults("gpii.resolvers.env", {
    gradeNames: ["fluid.component", "fluid.resolveRootSingle"],
    singleRootType: "gpii.resolvers.env",
    members: {
        vars: process.env
    }
});

// Create an instance of gpii.resolvers.env
fluid.construct("gpii_resolvers_env", {
    type: "gpii.resolvers.env"
});

/**
 * Validates a JSON object against a schema.
 * By default the components own options are validated against the provided
 * schema and events are fired for success (validated) and error (validationError).
 *
 * @throws {Error} - by default will throw an error if validation fails
 */
fluid.defaults("gpii.schema", {
    gradeNames: ["fluid.component"],
    schema: {},
    events: {
        validated: null,
        validationError: null
    },
    listeners: {
        "validationError.fail": "fluid.fail",
        "onCreate.validate": "{that}.validate"
    },
    invokers: {
        validate: {
            funcName: "gpii.schema.validate",
            args: ["{that}.options.schema", "{that}.options", "{that}.events.validated.fire", "{that}.events.validationError.fire"]
        }
    }
});

/**
 * Performs the JSON validation against toValidate with the provide schema.
 *
 * @param schema {Object} - the JSON schema to validate with
 * @param toValidate {Object} - the JSON object to validate
 * @param success {Function} - the success callback
 * @param error {Function} - the error callback
 */
gpii.schema.validate = function (schema, toValidate, success, error) {
    var validator = ajv();
    var isValid = validator.validate(schema, toValidate);

    if (isValid) {
        success();
    } else {
        error(validator.errorsText());
    }
};
