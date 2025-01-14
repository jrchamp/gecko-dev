// |reftest| skip-if(!this.hasOwnProperty('Atomics')) -- Atomics is not enabled unconditionally
// Copyright (C) 2015 André Bargull. All rights reserved.
// Copyright (C) 2017 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-atomics.wake
description: >
  Atomics.wake.name is "wake".
includes: [propertyHelper.js]
features: [Atomics]
---*/

verifyProperty(Atomics.wake, 'name', {
  value: 'wake',
  enumerable: false,
  writable: false,
  configurable: true,
});

reportCompare(0, 0);
