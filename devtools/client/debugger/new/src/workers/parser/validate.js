"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasSyntaxError = hasSyntaxError;

var _ast = require("./utils/ast");

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */
function hasSyntaxError(input) {
  try {
    (0, _ast.parseScript)(input);
    return false;
  } catch (e) {
    return `${e.name} : ${e.message}`;
  }
}