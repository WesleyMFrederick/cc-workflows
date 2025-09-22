#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";

/**
 * Parse YAML front matter from a markdown file
 * @param {string} filePath - Path to the markdown file
 * @returns {Object} - {frontMatter: Object, content: string}
 */
function parseFrontMatter(filePath) {
	const content = fs.readFileSync(filePath, "utf8");
	const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

	if (!frontMatterMatch) {
		throw new Error(`No YAML front matter found in ${filePath}`);
	}

	const [, frontMatterText, markdownContent] = frontMatterMatch;
	const frontMatter = yaml.parse(frontMatterText);

	return { frontMatter, content: markdownContent };
}

/**
 * Validate that input file type matches task requirements
 * @param {Object} taskFrontMatter - Front matter from task file
 * @param {Object} inputFrontMatter - Front matter from input file
 * @param {string} inputFilePath - Path to input file for error messages
 */
function validateInputType(taskFrontMatter, inputFrontMatter, inputFilePath) {
	const requiredInputs = taskFrontMatter["required-inputs"] || [];

	for (const input of requiredInputs) {
		if (input["expected-type"]) {
			const expectedType = input["expected-type"];
			const actualType = inputFrontMatter.type;

			if (actualType !== expectedType) {
				throw new Error(
					`Type mismatch: ${inputFilePath} is type "${actualType}" but task expects "${expectedType}"`,
				);
			}
		}
	}
}

/**
 * Extract required fields from agent file content using regex fallback
 * @param {string} content - Raw file content
 * @returns {Object} - Object with extracted fields
 */
function extractRequiredFields(content) {
	const nameMatch = content.match(/^name:\s*(.+)$/m);
	const personaNameMatch = content.match(/^persona-name:\s*(.+)$/m);

	return {
		name: nameMatch ? nameMatch[1].trim() : null,
		"persona-name": personaNameMatch ? personaNameMatch[1].trim() : null,
	};
}

/**
 * Parse config file that may be pure YAML or have front-matter
 * @param {string} filePath - Path to config file
 * @returns {Object} - {frontMatter: Object} consistent format
 */
function parseConfigFile(filePath) {
	const content = fs.readFileSync(filePath, "utf8");

	// Check if file starts with front-matter delimiters
	if (content.startsWith("---\n")) {
		// Has front-matter, use existing parser
		const { frontMatter } = parseFrontMatter(filePath);
		return { frontMatter };
	} else {
		// Pure YAML file, parse directly
		const configData = yaml.parse(content);
		return { frontMatter: configData };
	}
}

/**
 * Parse agent metadata robustly with fallback strategy
 * @param {string} filePath - Path to agent file
 * @returns {Object} - Agent front matter with required fields
 */
function parseAgentMetadata(filePath) {
	const content = fs.readFileSync(filePath, "utf8");

	try {
		// Try full YAML parsing first
		const { frontMatter } = parseFrontMatter(filePath);
		return frontMatter;
	} catch {
		console.warn(
			`YAML parsing failed for ${filePath}, using selective extraction`,
		);
		// Fallback: selective field extraction
		return extractRequiredFields(content);
	}
}

/**
 * Replace template variables in content
 * @param {string} content - Template content with {{variables}}
 * @param {Object} variables - Object with variable values
 * @returns {string} - Content with variables replaced
 */
function replaceTemplateVariables(content, variables) {
	// First pass: replace template variables
	let result = content.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
		const trimmedName = variableName.trim();

		if (Object.hasOwn(variables, trimmedName)) {
			return variables[trimmedName];
		} else {
			console.warn(
				`Warning: Variable "${trimmedName}" not found, leaving as-is`,
			);
			return match;
		}
	});

	// Second pass: resolve any @relative/paths to absolute paths
	result = result.replace(/@([^@\s\n]+)/g, (_match, relativePath) => {
		return `@${path.resolve(relativePath)}`;
	});

	return result;
}

/**
 * Extract the entire "Known Issues" section content
 * @param {string} content - Story file content
 * @returns {string} - The complete Known Issues section content or empty string
 */
function extractKnownIssuesSection(content) {
	// Find the "Known Issues" section
	const sectionMatch = content.match(/### Known Issues([\s\S]*?)(?=###|$)/);
	if (!sectionMatch) return "";

	return sectionMatch[1].trim();
}

/**
 * Display help information
 */
function showHelp() {
	console.log(`
Task Prompt Parser

Usage:
  node parse-prompt.js <task-file> <input-file> [agent-file] [key=value] [key=value]...

Arguments:
  task-file    Path to the task markdown file (e.g., .bmad-core/tasks/review-user-story-code-implement.md)
  input-file   Path to the input file (e.g., user story, code file, etc.)
  agent-file   Optional path to agent file (e.g., .claude/agents/engineering-mentor-code.md)
  key=value    Optional variables to pass to task template (e.g., issue-description="Test files moved")

Examples:
  node parse-prompt.js .bmad-core/tasks/review-user-story-code-implement.md docs/features/feature-claude-transcript-loading/stories/1.1.file-selection-interface.md
  node parse-prompt.js .bmad-core/tasks/review-user-story-code-implement.md docs/features/feature-claude-transcript-loading/stories/1.1.file-selection-interface.md .claude/agents/engineering-mentor-code.md
  node parse-prompt.js agentic-workflows/tasks/fix-issue.md story.md issue-description="Test infrastructure path mismatch" issue-type="infrastructure"

The script will:
1. Parse YAML front matter from both files
2. Validate that input file type matches task requirements
3. Replace template variables in task content
4. Output the processed prompt ready for agent consumption
`);
}

/**
 * Main function
 */
function main() {
	const args = process.argv.slice(2);

	if (args.includes("--help") || args.length < 2) {
		showHelp();
		process.exit(args.includes("--help") ? 0 : 1);
	}

	const [taskFilePath, inputFilePath] = args;
	const agentFilePath = args[2] && !args[2].includes("=") ? args[2] : null;

	// Parse key=value arguments (starting after agent file or position 2)
	const keyValueArgs = {};
	const startPos = agentFilePath ? 3 : 2;
	for (let i = startPos; i < args.length; i++) {
		const arg = args[i];
		if (arg.includes("=")) {
			const [key, ...valueParts] = arg.split("=");
			const value = valueParts.join("="); // Handle values containing '='
			keyValueArgs[key] = value;
		}
	}

	try {
		// Validate files exist
		if (!fs.existsSync(taskFilePath)) {
			throw new Error(`Task file not found: ${taskFilePath}`);
		}
		if (inputFilePath !== "none" && !fs.existsSync(inputFilePath)) {
			throw new Error(`Input file not found: ${inputFilePath}`);
		}

		// Parse task and input files
		const { frontMatter: taskFrontMatter, content: taskContent } =
			parseFrontMatter(taskFilePath);

		let inputFrontMatter = {};
		if (inputFilePath !== "none") {
			// Check if input file is a config file based on filename pattern
			const isConfigFile =
				inputFilePath.includes("config.yaml") ||
				inputFilePath.includes("config.yml");

			if (isConfigFile) {
				const parsed = parseConfigFile(inputFilePath);
				inputFrontMatter = parsed.frontMatter;
			} else {
				const parsed = parseFrontMatter(inputFilePath);
				inputFrontMatter = parsed.frontMatter;
			}
		} else {
			// When no input file, try to load default config file for template variables
			const defaultConfigPath = "agentic-workflows/config.yaml";
			if (fs.existsSync(defaultConfigPath)) {
				const parsed = parseConfigFile(defaultConfigPath);
				inputFrontMatter = parsed.frontMatter;
			}
		}

		// Parse agent file if provided
		let agentFrontMatter = {};
		if (agentFilePath) {
			if (!fs.existsSync(agentFilePath)) {
				throw new Error(`Agent file not found: ${agentFilePath}`);
			}
			agentFrontMatter = parseAgentMetadata(agentFilePath);
		}

		// Validate input type matches task requirements (skip if no input file)
		if (inputFilePath !== "none") {
			validateInputType(taskFrontMatter, inputFrontMatter, inputFilePath);
		}

		// Read input file content for section extraction
		const inputFileContent =
			inputFilePath !== "none" ? fs.readFileSync(inputFilePath, "utf8") : "";

		// Check if input file is a config file
		const isConfigFile =
			inputFilePath.includes("config.yaml") ||
			inputFilePath.includes("config.yml");

		// Always load the default config file for template variables
		let defaultConfigData = {};
		const defaultConfigPath = "agentic-workflows/config.yaml";
		if (fs.existsSync(defaultConfigPath)) {
			try {
				const parsed = parseConfigFile(defaultConfigPath);
				defaultConfigData = parsed.frontMatter;
			} catch (error) {
				console.warn(
					`Warning: Could not load default config file ${defaultConfigPath}: ${error.message}`,
				);
			}
		}

		// Build variables object for template replacement
		const variables = {
			// Input file path and derived values (convert to absolute path)
			"input.user-story-path":
				inputFilePath !== "none" ? path.resolve(inputFilePath) : "",

			// Config values from input file front matter (convert paths to absolute)
			"config.outputBase": inputFrontMatter.outputBase
				? path.resolve(inputFrontMatter.outputBase)
				: "",
			"config.featurePrefix": inputFrontMatter.featurePrefix || "",

			// Agent values if provided
			"agent.name":
				agentFrontMatter["persona-name"] ||
				agentFrontMatter.name ||
				"Unknown Agent",
			"agent.path": agentFilePath ? path.resolve(agentFilePath) : "",

			// Extract Known Issues section from story
			"story.known-issues": extractKnownIssuesSection(inputFileContent),

			// Add all default config values with config. prefix
			...Object.fromEntries(
				Object.entries(defaultConfigData).map(([key, value]) => [
					`config.${key}`,
					value,
				]),
			),

			// Add other config values from input file if present (this will override defaults if same key)
			...Object.fromEntries(
				Object.entries(inputFrontMatter)
					.filter(([key]) => !["type", "status", "feature"].includes(key))
					.map(([key, value]) => [`config.${key}`, value]),
			),

			// Add config file path - always include for template variable population
			"config.configFile": isConfigFile
				? path.basename(inputFilePath)
				: "agentic-workflows/config.yaml",

			// Add key=value arguments from command line
			...keyValueArgs,
		};

		// Replace variables in task content
		const processedContent = replaceTemplateVariables(taskContent, variables);

		// Generate output filename using the pattern: epicNumber.userStoryNumber.requirementName-task-name-prompt.md
		// Use command line arguments if available, otherwise fall back to input front matter
		const epicNumber =
			keyValueArgs.epicNum || inputFrontMatter.epicNumber || "unknown";
		const userStoryNumber =
			keyValueArgs.storyNum || inputFrontMatter.userStoryNumber || "unknown";
		const requirementName =
			keyValueArgs.story_title_slug ||
			keyValueArgs.feature_name || // Backward compatibility
			inputFrontMatter.requirementName ||
			"unknown";

		const outputFilename = `${epicNumber}.${userStoryNumber}.${requirementName}-${taskFrontMatter["task-name"]}-prompt.md`;

		// Determine output directory based on input file type
		let outputDir;

		if (isConfigFile && inputFrontMatter.devStoryLocation) {
			// For config files, use devStoryLocation to save in correct stories directory
			outputDir = inputFrontMatter.devStoryLocation;
		} else {
			// For story files, save in the same directory as the story
			outputDir = path.dirname(inputFilePath);
		}

		const outputPath = path.join(outputDir, outputFilename);

		// Save processed content to file
		fs.writeFileSync(outputPath, processedContent);
		console.log(`✅ Processed prompt saved to: ${outputPath}`);

		// Also output to console for immediate viewing
		console.log("\n--- Processed Prompt Content ---\n");
		console.log(processedContent);
	} catch (error) {
		console.error("Error:", error.message);
		process.exit(1);
	}
}

// Run the script
main();
