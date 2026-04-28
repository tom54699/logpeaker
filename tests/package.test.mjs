import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packageJsonPath = path.join(root, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

test("extension activates on the panel view", () => {
  assert.deepEqual(packageJson.activationEvents, [
    "onView:logPeak.panelView",
    "onCommand:logPeak.toggleBossMode",
  ]);
  assert.equal(packageJson.main, "./out/extension.js");
});

test("package contributes a Log Peak panel view container", () => {
  const panelContainers = packageJson.contributes?.viewsContainers?.panel ?? [];
  const logPeakContainer = panelContainers.find((item) => item.id === "logPeak");

  assert.ok(logPeakContainer);
  assert.equal(logPeakContainer.title, "Log Peak");

  const panelViews = packageJson.contributes?.views?.logPeak ?? [];
  const panelView = panelViews.find((item) => item.id === "logPeak.panelView");

  assert.ok(panelView);
  assert.equal(panelView.type, "webview");

  const commands = packageJson.contributes?.commands ?? [];
  const toggleBossModeCommand = commands.find((item) => item.command === "logPeak.toggleBossMode");

  assert.ok(toggleBossModeCommand);
  assert.equal(toggleBossModeCommand.title, "Toggle Boss Mode");

  const keybindings = packageJson.contributes?.keybindings ?? [];
  const toggleBossModeKeybinding = keybindings.find((item) => item.command === "logPeak.toggleBossMode");

  assert.ok(toggleBossModeKeybinding);
  assert.equal(toggleBossModeKeybinding.key, "ctrl+alt+`");
  assert.equal(toggleBossModeKeybinding.mac, "cmd+alt+`");
  assert.equal(toggleBossModeKeybinding.when, "logPeak.visible");
});

test("panel assets exist", () => {
  assert.ok(fs.existsSync(path.join(root, "media", "panel.css")));
  assert.ok(fs.existsSync(path.join(root, "media", "logpeak.svg")));
});

test("logPeak.hoverDisguise setting is declared with default true", () => {
  const config = packageJson.contributes?.configuration;
  assert.ok(config, "contributes.configuration should exist");

  const prop = config.properties?.["logPeak.hoverDisguise"];
  assert.ok(prop, "logPeak.hoverDisguise property should be declared");
  assert.equal(prop.type, "boolean");
  assert.equal(prop.default, true);
});

test("toggleHoverDisguise command is not present", () => {
  const commands = packageJson.contributes?.commands ?? [];
  const found = commands.find((item) => item.command === "logPeak.toggleHoverDisguise");
  assert.equal(found, undefined, "toggleHoverDisguise command should be removed");
});
