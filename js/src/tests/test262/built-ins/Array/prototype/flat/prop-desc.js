// Copyright (C) 2018 Shilpi Jain and Michael Ficarra. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
esid: sec-array.prototype.flat
es6id: 22.1.3
description: Property type and descriptor.
info: >
  17 ECMAScript Standard Built-in Objects
includes: [propertyHelper.js]
features: [Array.prototype.flat]
---*/

assert.sameValue(
  typeof Array.prototype.flat,
  'function',
  '`typeof Array.prototype.flat` is `function`'
);

verifyNotEnumerable(Array.prototype, 'flat');
verifyWritable(Array.prototype, 'flat');
verifyConfigurable(Array.prototype, 'flat');

reportCompare(0, 0);
