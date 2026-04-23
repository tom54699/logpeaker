import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packageJsonPath = path.join(root, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

test("extension activates on the panel view", () => {
  assert.deepEqual(packageJson.activationEvents, ["onView:logPeak.panelView"]);
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
});

test("panel assets exist", () => {
  assert.ok(fs.existsSync(path.join(root, "media", "panel.css")));
  assert.ok(fs.existsSync(path.join(root, "media", "logpeak.svg")));
});
