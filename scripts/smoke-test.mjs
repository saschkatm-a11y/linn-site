import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const dataSource = fs.readFileSync(new URL("../data.js", import.meta.url), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(dataSource, context);

const requiredIds = [
  "openGiftButton",
  "journeyView",
  "depthWorld",
  "journeyPanel",
  "journeyNextButton",
  "complimentCard",
  "nextButton",
  "hugButton",
  "treasureModal",
  "settingsModal",
  "effectLayer"
];

for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Fehlendes Element: #${id}`);
}

if (context.window.LINN_DATA.compliments.length !== 200) {
  throw new Error(`Erwartet wurden 200 Komplimente, gefunden: ${context.window.LINN_DATA.compliments.length}`);
}

const uniqueTexts = new Set(context.window.LINN_DATA.compliments.map((item) => item.text));
if (uniqueTexts.size !== 200) throw new Error("Komplimenttexte sind nicht eindeutig.");

if (html.includes("data-mood=")) {
  throw new Error("Die Komplimente dürfen nicht mehr nach Stimmung ausgewählt werden.");
}

console.log("Smoke-Test erfolgreich: 3D-Reise, Zufallsfinale und 200 eindeutige Komplimente vorhanden.");
