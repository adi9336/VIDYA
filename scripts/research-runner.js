const fs = require("fs");
const path = require("path");

const root = process.cwd();
const resultsPath = path.join(root, "research", "results.tsv");
const scenariosDir = path.join(root, "research", "scenarios");

function main() {
  const scenarioFiles = fs.readdirSync(scenariosDir).filter((file) => file.endsWith(".json"));
  console.log("Vidya AI research runner");
  console.log(`Scenarios: ${scenarioFiles.length}`);
  console.log(`Results file: ${resultsPath}`);
  console.log("This script is a lightweight entrypoint for the offline tutoring eval loop.");
}

main();
