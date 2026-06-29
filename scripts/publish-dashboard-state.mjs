#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import process from "node:process";

function parseArgs(argv) {
  const args = {
    update: true,
    dryRun: false,
    message: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--no-update") {
      args.update = false;
      continue;
    }
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (arg === "--message") {
      args.message = argv[++i];
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    ...options,
  });
  if (result.status !== 0) {
    const details = options.capture ? result.stderr || result.stdout : "";
    throw new Error(`${command} ${args.join(" ")} failed${details ? `:\n${details}` : ""}`);
  }
  return result.stdout || "";
}

function gitOutput(args) {
  return run("git", args, { capture: true }).trim();
}

const publishPaths = ["records/dashboard_state.yaml", "records/flow_step_changes"];

function printHelp() {
  process.stdout.write([
    "Usage: node scripts/publish-dashboard-state.mjs [options]",
    "",
    "Options:",
    "  --no-update          Do not regenerate records/dashboard_state.yaml first",
    "  --message <message>  Commit message",
    "  --dry-run            Validate and show pending commit without committing/pushing",
  ].join("\n"));
  process.stdout.write("\n");
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.update) {
  run("node", ["scripts/update-dashboard-state.mjs"]);
}

run("npm", ["run", "validate:flow-007"]);

const changedDashboard = gitOutput(["status", "--short", "--", ...publishPaths]);
if (!changedDashboard) {
  process.stdout.write("No dashboard state changes to publish.\n");
  process.exit(0);
}

if (args.dryRun) {
  run("git", ["diff", "--", ...publishPaths]);
  const status = gitOutput(["status", "--short", "--", ...publishPaths]);
  if (status) {
    process.stdout.write(`${status}\n`);
  }
  process.stdout.write("Dry run: dashboard state validated but not committed or pushed.\n");
  process.exit(0);
}

run("git", ["add", ...publishPaths]);
const commitMessage = args.message || `Update dashboard state ${new Date().toISOString()}`;
run("git", ["commit", "-m", commitMessage, "--", ...publishPaths]);
run("git", ["push", "origin", "main"]);
