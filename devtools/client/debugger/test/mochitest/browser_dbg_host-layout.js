/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

/**
 * This if the debugger's layout is correctly modified when the toolbox's
 * host changes.
 */

"use strict";

var gDefaultHostType = Services.prefs.getCharPref("devtools.toolbox.host");

function test() {
  // test is too slow on some platforms due to the number of test cases
  requestLongerTimeout(3);

  (async function() {
    await testHosts(["bottom", "right", "window:big"], ["horizontal", "vertical", "horizontal"]);
    await testHosts(["right", "bottom", "right"], ["vertical", "horizontal", "vertical"]);
    await testHosts(["bottom", "right", "bottom"], ["horizontal", "vertical", "horizontal"]);
    await testHosts(["right", "window:big", "right"], ["vertical", "horizontal", "vertical"]);
    await testHosts(["window:big", "right", "window:big"], ["horizontal", "vertical", "horizontal"]);
    await testHosts(["window:small", "bottom", "right"], ["vertical", "horizontal", "vertical"]);
    await testHosts(["window:small", "window:big", "window:small"], ["vertical", "horizontal", "vertical"]);
    finish();
  })();
}

async function testHosts(aHostTypes, aLayoutTypes) {
  let [firstHost, secondHost, thirdHost] = aHostTypes;
  let [firstLayout, secondLayout, thirdLayout] = aLayoutTypes;

  Services.prefs.setCharPref("devtools.toolbox.host", getHost(firstHost));

  let [tab, debuggee, panel] = await initDebugger();
  if (getHost(firstHost) === "window") {
    await resizeToolboxWindow(panel, firstHost);
  }

  await testHost(panel, getHost(firstHost), firstLayout);
  await switchAndTestHost(tab, panel, secondHost, secondLayout);
  await switchAndTestHost(tab, panel, thirdHost, thirdLayout);
  await teardown(panel);
}

async function switchAndTestHost(aTab, aPanel, aHostType, aLayoutType) {
  let gToolbox = aPanel._toolbox;
  let gDebugger = aPanel.panelWin;

  let layoutChanged = waitEventOnce(gDebugger, gDebugger.EVENTS.LAYOUT_CHANGED);
  let hostChanged = gToolbox.switchHost(getHost(aHostType));

  await hostChanged;
  info("The toolbox's host has changed.");

  if (getHost(aHostType) === "window") {
    await resizeToolboxWindow(aPanel, aHostType);
  }

  await layoutChanged;
  info("The debugger's layout has changed.");

  await testHost(aPanel, getHost(aHostType), aLayoutType);
}

function waitEventOnce(aTarget, aEvent) {
  return new Promise(resolve => aTarget.once(aEvent, resolve));
}

function getHost(host) {
  if (host.indexOf("window") == 0) {
    return "window";
  }
  return host;
}

async function resizeToolboxWindow(panel, host) {
  let sizeOption = host.split(":")[1];
  let win = panel._toolbox.win.parent;

  // should be the same value as BREAKPOINT_SMALL_WINDOW_WIDTH in debugger-view.js
  let breakpoint = 850;

  if (sizeOption == "big" && win.outerWidth <= breakpoint) {
    await resizeAndWaitForLayoutChange(panel, breakpoint + 300);
  } else if (sizeOption == "small" && win.outerWidth >= breakpoint) {
    await resizeAndWaitForLayoutChange(panel, breakpoint - 300);
  } else {
    info("Window resize unnecessary for host " + host);
  }
}

async function resizeAndWaitForLayoutChange(panel, width) {
  info("Updating toolbox window width to " + width);

  let win = panel._toolbox.win.parent;
  let gDebugger = panel.panelWin;

  win.resizeTo(width, window.screen.availHeight);
  await waitEventOnce(gDebugger, gDebugger.EVENTS.LAYOUT_CHANGED);
}

function testHost(aPanel, aHostType, aLayoutType) {
  let gDebugger = aPanel.panelWin;
  let gView = gDebugger.DebuggerView;

  is(gView._hostType, aHostType,
    "The default host type should've been set on the panel window (1).");
  is(gDebugger.gHostType, aHostType,
    "The default host type should've been set on the panel window (2).");

  is(gView._body.getAttribute("layout"), aLayoutType,
    "The default host type is present as an attribute on the panel's body.");

  if (aLayoutType == "horizontal") {
    is(gView._workersAndSourcesPane.parentNode.id, "debugger-widgets",
      "The workers and sources pane's parent is correct for the horizontal layout.");
    is(gView._instrumentsPane.parentNode.id, "editor-and-instruments-pane",
      "The instruments pane's parent is correct for the horizontal layout.");
  } else {
    is(gView._workersAndSourcesPane.parentNode.id, "vertical-layout-panes-container",
      "The workers and sources pane's parent is correct for the vertical layout.");
    is(gView._instrumentsPane.parentNode.id, "vertical-layout-panes-container",
      "The instruments pane's parent is correct for the vertical layout.");
  }

  let widgets = gDebugger.document.getElementById("debugger-widgets").childNodes;
  let content = gDebugger.document.getElementById("debugger-content").childNodes;
  let editorPane =
    gDebugger.document.getElementById("editor-and-instruments-pane").childNodes;
  let verticalPane =
    gDebugger.document.getElementById("vertical-layout-panes-container").childNodes;

  if (aLayoutType == "horizontal") {
    is(widgets.length, 5, // 1 pane, 1 content box, 2 splitters and a phantom box.
      "Found the correct number of debugger widgets.");
    is(content.length, 1, // 1 pane
      "Found the correct number of debugger content.");
    is(editorPane.length, 3, // 2 panes, 1 splitter
      "Found the correct number of debugger panes.");
    is(verticalPane.length, 1, // 1 lonely splitter in the phantom box.
      "Found the correct number of debugger panes.");
  } else {
    is(widgets.length, 4, // 1 content box, 2 splitters and a phantom box.
      "Found the correct number of debugger widgets.");
    is(content.length, 1, // 1 pane
      "Found the correct number of debugger content.");
    is(editorPane.length, 2, // 1 pane, 1 splitter
      "Found the correct number of debugger panes.");
    is(verticalPane.length, 3, // 2 panes and 1 splitter in the phantom box.
      "Found the correct number of debugger panes.");
  }
}

registerCleanupFunction(function() {
  Services.prefs.setCharPref("devtools.toolbox.host", gDefaultHostType);
  gDefaultHostType = null;
});
