require("dotenv").config();

module.exports = {
  apps: [
    {
      name: "trevonis",
      exec_mode: process.env.EXEC_MODE,
      interpreter: process.env.INTERPRETER,
      instances: process.env.CPU_INSTANCES
        ? Number(process.env.CPU_INSTANCES)
        : undefined,
      script: "dist/src/index.js",
    },
  ],
};
