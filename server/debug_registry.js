const registry = require("./skills/registry");

async function debug() {
  console.log("Initializing registry...");
  await registry.initialize();

  const errors = registry.getLoadErrors();
  if (errors.length > 0) {
    console.log("ERRORS:", JSON.stringify(errors, null, 2));
  } else {
    console.log("No load errors.");
  }

  const plugin = registry.getPlugin("learning");
  console.log("Learning Plugin:", plugin ? "Loaded" : "Not Found");
}

debug();
