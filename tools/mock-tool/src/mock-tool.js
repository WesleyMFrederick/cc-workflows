#!/usr/bin/env node

import { greet } from "./greeter.js";

// Parse command-line arguments (first argument after script name)
const name = process.argv[2] || "World";

// Output greeting to stdout
console.log(greet(name));
