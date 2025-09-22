#!/usr/bin/env node

import fs, { readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

/**
 * Convert heading text to kebab-case filename
 * @param {string} heading - The heading text (e.g., "## Tech Stack")
 * @returns {string} - Kebab-case filename (e.g., "tech-stack")
 */
function headingToFilename(heading) {
	return heading
		.replace(/^#+\s*/, "") // Remove markdown heading syntax
		.toLowerCase()
		.replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
		.replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Check if a line is inside a fenced code block
 * @param {string[]} lines - All lines in document
 * @param {number} lineIndex - Current line index
 * @returns {boolean} - True if inside code block
 */
function isInsideCodeBlock(lines, lineIndex) {
	let inCodeBlock = false;
	for (let i = 0; i < lineIndex; i++) {
		if (lines[i].trim().startsWith("```")) {
			inCodeBlock = !inCodeBlock;
		}
	}
	return inCodeBlock;
}

/**
 * Parse document into Level 2 sections
 * @param {string} content - The markdown content
 * @returns {Array} - Array of sections with heading and content
 */
function parseLevel2Sections(content) {
	const lines = content.split("\n");
	const sections = [];
	let currentSection = null;
	const introContent = [];
	let foundFirstLevel2 = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmedLine = line.trim();

		// Check for Level 2 heading (## ...) but not inside code blocks
		if (trimmedLine.match(/^##\s+/) && !isInsideCodeBlock(lines, i)) {
			foundFirstLevel2 = true;

			// Save current section if exists
			if (currentSection) {
				sections.push(currentSection);
			}

			// Start new section
			currentSection = {
				heading: line,
				content: [line],
			};
		} else {
			if (!foundFirstLevel2) {
				// Collect intro content before first Level 2 heading
				introContent.push(line);
			} else if (currentSection) {
				// Add to current section
				currentSection.content.push(line);
			}
		}
	}

	// Add final section
	if (currentSection) {
		sections.push(currentSection);
	}

	return { sections, introContent: introContent.join("\n") };
}

/**
 * Adjust heading levels in content (## -> #, ### -> ##, etc.)
 * @param {string[]} contentLines - Array of content lines
 * @returns {string[]} - Adjusted content lines
 */
function adjustHeadingLevels(contentLines) {
	return contentLines.map((line, index) => {
		const trimmedLine = line.trim();

		// Don't adjust headings inside code blocks
		if (isInsideCodeBlock(contentLines, index)) {
			return line;
		}

		// Adjust heading levels
		if (trimmedLine.match(/^#+\s+/)) {
			const headingMatch = line.match(/^(\s*)(#+)(\s+.*)$/);
			if (headingMatch) {
				const [, indent, hashes, rest] = headingMatch;
				// Remove one # (## becomes #, ### becomes ##, etc.)
				const newHashes = hashes.length > 1 ? hashes.slice(1) : hashes;
				return `${indent}${newHashes}${rest}`;
			}
		}
		return line;
	});
}

/**
 * Load configuration from agentic-workflows/config.yaml
 */
function loadConfig() {
	const configPath = path.join(
		process.cwd(),
		"agentic-workflows",
		"config.yaml",
	);
	try {
		const configContent = readFileSync(configPath, "utf8");
		return parseYaml(configContent);
	} catch (error) {
		console.warn(
			`Warning: Could not load config from ${configPath}: ${error.message}`,
		);
		return null;
	}
}

/**
 * Display help information
 */
function showHelp() {
	console.log(`
Markdown Document Sharding Tool

Usage:
  node shard-markdown.js [source-file] [output-directory] [options]

Config Mode (uses agentic-workflows/config.yaml):
  --doc <name>     Document name (prd, architecture)
  --config         Force config mode (auto-detected if no paths given)

Direct Mode:
  source-file      Path to the markdown file to shard
  output-directory Directory where sharded files will be created

Options:
  --use-headings   Generate filenames from heading text (kebab-case)
  --prefix <name>  Custom filename prefix (e.g., "prd" -> "prd-section-1.md")
  --start-index <n> Starting number for indexed files (default: 1)
  --help           Show this help message

Examples:
  # Config-based usage (recommended)
  node shard-markdown.js --doc prd --use-headings
  node shard-markdown.js --doc architecture --use-headings --prefix arch

  # Direct usage (legacy)
  node shard-markdown.js architecture.md ./architecture/ --use-headings
  node shard-markdown.js prd.md ./prd/ --prefix prd
`);
}

/**
 * Resolve paths using config
 */
function resolveConfigPaths(config, docType) {
	if (!config) {
		throw new Error("Config not loaded");
	}

	const outputBase = config.outputBase;
	const featurePrefix = config.featurePrefix;

	if (!outputBase || !featurePrefix) {
		throw new Error("Config missing outputBase or featurePrefix");
	}

	const basePath = path.join(outputBase, featurePrefix);

	let sourceFile, outputDir;

	if (docType === "prd") {
		sourceFile = path.join(basePath, config.prd?.prdFile || "prd.md");
		outputDir = path.join(basePath, config.prd?.prdShardedLocation || "prd/");
	} else if (docType === "architecture") {
		sourceFile = path.join(
			basePath,
			config.architecture?.architectureFile || "architecture.md",
		);
		outputDir = path.join(
			basePath,
			config.architecture?.architectureShardedLocation || "architecture/",
		);
	} else {
		throw new Error(
			`Unknown document type: ${docType}. Supported: prd, architecture`,
		);
	}

	return { sourceFile, outputDir };
}

/**
 * Parse command line arguments
 */
function parseArgs() {
	const args = process.argv.slice(2);

	if (args.includes("--help") || args.length === 0) {
		showHelp();
		process.exit(0);
	}

	// Check for config mode
	const docIndex = args.indexOf("--doc");
	const useConfig =
		docIndex !== -1 ||
		args.includes("--config") ||
		!args[0] ||
		args[0].startsWith("--");

	const options = {
		useHeadings: args.includes("--use-headings"),
		prefix: null,
		startIndex: 1,
	};

	// Parse --prefix option
	const prefixIndex = args.indexOf("--prefix");
	if (prefixIndex !== -1 && args[prefixIndex + 1]) {
		options.prefix = args[prefixIndex + 1];
	}

	// Parse --start-index option
	const startIndexIndex = args.indexOf("--start-index");
	if (startIndexIndex !== -1 && args[startIndexIndex + 1]) {
		const startIndex = parseInt(args[startIndexIndex + 1], 10);
		if (!Number.isNaN(startIndex)) {
			options.startIndex = startIndex;
		}
	}

	if (useConfig) {
		// Config mode
		const config = loadConfig();
		if (!config) {
			console.error(
				"Error: Config mode requires agentic-workflows/config.yaml",
			);
			process.exit(1);
		}

		const docType = docIndex !== -1 ? args[docIndex + 1] : null;
		if (!docType) {
			console.error("Error: --doc parameter required in config mode");
			showHelp();
			process.exit(1);
		}

		try {
			const { sourceFile, outputDir } = resolveConfigPaths(config, docType);
			return { sourceFile, outputDir, options, config };
		} catch (error) {
			console.error(`Error: ${error.message}`);
			process.exit(1);
		}
	} else {
		// Direct mode
		const sourceFile = args[0];
		const outputDir = args[1];

		if (!sourceFile || !outputDir) {
			console.error(
				"Error: Both source-file and output-directory are required in direct mode",
			);
			showHelp();
			process.exit(1);
		}

		return { sourceFile, outputDir, options };
	}
}

/**
 * Generate filename based on options
 */
function generateFilename(section, index, options) {
	if (options.useHeadings && section.heading) {
		const baseFilename = headingToFilename(section.heading);
		if (baseFilename) {
			return options.prefix
				? `${options.prefix}-${baseFilename}.md`
				: `${baseFilename}.md`;
		}
	}

	// Fallback to index-based naming
	const fileIndex = index + options.startIndex;
	if (options.prefix) {
		return `${options.prefix}-section-${fileIndex}.md`;
	}
	return `section-${fileIndex}.md`;
}

/**
 * Create index file with links to all sharded files
 */
function createIndexFile(outputDir, filenames, sourceFile) {
	const originalTitle = path.basename(sourceFile, ".md");

	let indexContent = `# ${originalTitle.charAt(0).toUpperCase() + originalTitle.slice(1)}\n\n`;
	indexContent += `This document has been sharded into the following sections:\n\n`;

	filenames.forEach((filename) => {
		const sectionName = path
			.basename(filename, ".md")
			.replace(/^section-\d+-?/, "") // Remove "section-N-" prefix
			.replace(/-/g, " ") // Replace hyphens with spaces
			.replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize words

		indexContent += `- [${sectionName}](./${filename})\n`;
	});

	const indexPath = path.join(outputDir, "index.md");
	fs.writeFileSync(indexPath, indexContent);
	console.log(`Created index file: ${indexPath}`);
}

/**
 * Main function
 */
async function main() {
	try {
		const { sourceFile, outputDir, options } = parseArgs();

		// Validate source file exists
		if (!fs.existsSync(sourceFile)) {
			console.error(`Error: Source file '${sourceFile}' does not exist`);
			process.exit(1);
		}

		// Create output directory if it doesn't exist
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
			console.log(`Created output directory: ${outputDir}`);
		}

		// Read source document
		console.log(`Reading source file: ${sourceFile}`);
		const content = fs.readFileSync(sourceFile, "utf8");

		// Parse document into Level 2 sections
		console.log("Parsing document sections...");
		const { sections, introContent } = parseLevel2Sections(content);

		if (sections.length === 0) {
			console.log("No Level 2 sections found to shard");
			process.exit(0);
		}

		console.log(`Found ${sections.length} sections to shard`);

		// Write individual files
		const filenames = [];
		sections.forEach((section, index) => {
			const filename = generateFilename(section, index, options);
			const filePath = path.join(outputDir, filename);

			// Adjust heading levels and create content
			const adjustedContent = adjustHeadingLevels(section.content);
			const fileContent = adjustedContent.join("\n");

			fs.writeFileSync(filePath, fileContent);
			filenames.push(filename);

			console.log(`Created: ${filePath}`);
		});

		// Write intro content to separate file if it exists
		if (introContent.trim()) {
			const introFilename = options.prefix
				? `${options.prefix}-intro.md`
				: "intro.md";
			const introPath = path.join(outputDir, introFilename);
			fs.writeFileSync(introPath, introContent);
			filenames.unshift(introFilename); // Add to beginning of list
			console.log(`Created: ${introPath}`);
		}

		// Create index file
		createIndexFile(outputDir, filenames, sourceFile);

		console.log(`\nSharding completed successfully!`);
		console.log(`- Source: ${sourceFile}`);
		console.log(`- Output: ${outputDir}`);
		console.log(
			`- Files created: ${filenames.length + 1} (including index.md)`,
		);
	} catch (error) {
		console.error("Error:", error.message);
		process.exit(1);
	}
}

// Run the script
main();
