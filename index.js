/*
Copyright 2015 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/first-discovery-server/master/LICENSE.txt
*/

"use strict";

var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");
require("./src/js/firstDiscoveryServer.js");


gpii.firstDiscovery.server({
    port: process.env.FIRST_DISCOVERY_SERVER_TCP_PORT
});
