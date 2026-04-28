import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Get the mutable vscode stub — same reference the provider will use
const vscodeMock = require("../node_modules/vscode/index.js");

function setupMock(hoverDisguise) {
  vscodeMock.commands = { executeCommand: async () => {} };
  vscodeMock.workspace = {
    getConfiguration: (section) => ({
      get: (key, defaultValue) => {
        if (section === "logPeak" && key === "hoverDisguise") return hoverDisguise;
        return defaultValue;
      },
    }),
    onDidChangeConfiguration: () => ({ dispose: () => {} }),
  };
  vscodeMock.Uri = {
    joinPath: (...args) => ({ toString: () => args.join("/") }),
    parse: (str) => ({ toString: () => str }),
  };
  vscodeMock.window = { showOpenDialog: async () => undefined };
}

// Initialize before requiring provider
setupMock(true);
const { LogPeakPanelViewProvider } = require("../out/panel/logPeakPanelViewProvider.js");

function makeMemento() {
  const store = new Map();
  return {
    get: (key, defaultValue) => store.has(key) ? store.get(key) : defaultValue,
    update: async (key, value) => { store.set(key, value); },
    keys: () => [...store.keys()],
  };
}

function makeWebviewView() {
  const postedMessages = [];
  return {
    visible: true,
    webview: {
      options: {},
      html: "",
      asWebviewUri: (uri) => uri,
      onDidReceiveMessage: () => ({ dispose: () => {} }),
      postMessage: async (msg) => { postedMessages.push(msg); return true; },
    },
    onDidChangeVisibility: () => ({ dispose: () => {} }),
    _postedMessages: postedMessages,
  };
}

test("readHoverDisguiseSetting returns true when setting is true", () => {
  setupMock(true);
  const provider = new LogPeakPanelViewProvider({ toString: () => "/fake/ext" }, makeMemento());
  assert.equal(provider["readHoverDisguiseSetting"](), true);
});

test("readHoverDisguiseSetting returns false when setting is false", () => {
  setupMock(false);
  const provider = new LogPeakPanelViewProvider({ toString: () => "/fake/ext" }, makeMemento());
  assert.equal(provider["readHoverDisguiseSetting"](), false);
});

test("updateHoverDisguiseSetting updates loaded state hoverDisguise.enabled and renders", () => {
  setupMock(false);
  const provider = new LogPeakPanelViewProvider({ toString: () => "/fake/ext" }, makeMemento());

  provider["state"] = {
    kind: "loaded",
    fileName: "test.txt",
    content: "hello",
    metaText: "meta",
    toolbarSourceLabel: "label",
    restoreTarget: null,
    chromeState: { mode: "expanded", pinned: false },
    hoverDisguise: { enabled: true, bossMetaText: "boss", bossRows: [] },
  };

  const view = makeWebviewView();
  provider["view"] = view;

  provider.updateHoverDisguiseSetting();

  assert.equal(provider["state"].hoverDisguise.enabled, false);
  assert.ok(
    view._postedMessages.some((m) => m.type === "renderState"),
    "should post renderState after update",
  );
});
