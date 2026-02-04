#!/usr/bin/env node
/**
 * Instinct CLI - Manage instincts for Continuous Learning v2
 *
 * Commands:
 * status   - Show all instincts and their status
 * import   - Import instincts from file or URL (Phase 4)
 * export   - Export instincts to file (Phase 4)
 * evolve   - Cluster instincts into skills (Phase 4)
 */

import path from "node:path";
import { findFiles, log, readFile } from "./lib/learning-utils.js";

// ─────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const LEARNED_DIR = path.join(PROJECT_DIR, ".claude", "learned");
const INSTINCTS_DIR = path.join(LEARNED_DIR, "instincts");
const PERSONAL_DIR = path.join(INSTINCTS_DIR, "personal");
const INHERITED_DIR = path.join(INSTINCTS_DIR, "inherited");
const OBSERVATIONS_FILE = path.join(LEARNED_DIR, "observations.jsonl");

// ─────────────────────────────────────────
// Instinct Parser
// ─────────────────────────────────────────

/**
 * Parse YAML-like instinct file format.
 * @param {string} content - File content
 * @returns {Array<Object>} Parsed instincts
 */
export function parseInstinctFile(content) {
	const instincts = [];
	let current = {};
	let inFrontmatter = false;
	let contentLines = [];
	let startedFrontmatter = false;

	for (const line of content.split("\n")) {
		if (line.trim() === "---") {
			if (startedFrontmatter && inFrontmatter) {
				// End of frontmatter
				inFrontmatter = false;
			} else if (!startedFrontmatter) {
				// Start of frontmatter
				startedFrontmatter = true;
				inFrontmatter = true;
				if (Object.keys(current).length > 0) {
					current.content = contentLines.join("\n").trim();
					instincts.push(current);
				}
				current = {};
				contentLines = [];
			} else {
				// Start of new instinct
				if (Object.keys(current).length > 0) {
					current.content = contentLines.join("\n").trim();
					instincts.push(current);
				}
				current = {};
				contentLines = [];
				inFrontmatter = true;
			}
		} else if (inFrontmatter) {
			// Parse YAML-like frontmatter
			const colonIdx = line.indexOf(":");
			if (colonIdx !== -1) {
				const key = line.slice(0, colonIdx).trim();
				let value = line.slice(colonIdx + 1).trim();
				// Remove quotes
				value = value.replace(/^["']|["']$/g, "");
				if (key === "confidence") {
					current[key] = Number.parseFloat(value);
				} else {
					current[key] = value;
				}
			}
		} else {
			contentLines.push(line);
		}
	}

	// Don't forget the last instinct
	if (Object.keys(current).length > 0) {
		current.content = contentLines.join("\n").trim();
		instincts.push(current);
	}

	// Filter out instincts without id
	return instincts.filter((i) => i.id);
}

/**
 * Load all instincts from personal and inherited directories.
 * @param {string} baseDir - Base learned directory (defaults to LEARNED_DIR)
 * @returns {Array<Object>} All loaded instincts
 */
export function loadAllInstincts(baseDir = LEARNED_DIR) {
	const instincts = [];
	const personalDir = path.join(baseDir, "instincts", "personal");
	const inheritedDir = path.join(baseDir, "instincts", "inherited");

	for (const [directory, sourceType] of [
		[personalDir, "personal"],
		[inheritedDir, "inherited"],
	]) {
		const files = findFiles(directory, ".yaml");
		for (const file of files) {
			const content = readFile(file);
			if (content) {
				try {
					const parsed = parseInstinctFile(content);
					for (const inst of parsed) {
						inst._sourceFile = file;
						inst._sourceType = sourceType;
					}
					instincts.push(...parsed);
				} catch (e) {
					log(`Warning: Failed to parse ${file}: ${e.message}`);
				}
			}
		}
	}

	return instincts;
}

// ─────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────

/**
 * Format confidence as 10-char visual bar.
 * @param {number} confidence - 0.0 to 1.0
 * @returns {string} Visual bar
 */
export function formatConfidenceBar(confidence) {
	const filled = Math.floor(confidence * 10);
	return "█".repeat(filled) + "░".repeat(10 - filled);
}

/**
 * Format status output for display.
 * @param {Array<Object>} instincts - Instincts to format
 * @returns {string} Formatted output
 */
export function formatStatus(instincts) {
	if (instincts.length === 0) {
		return `No instincts found.\n\nInstinct directories:\n  Personal:  ${PERSONAL_DIR}\n  Inherited: ${INHERITED_DIR}\n`;
	}

	// Group by domain
	const byDomain = {};
	for (const inst of instincts) {
		const domain = inst.domain || "general";
		if (!byDomain[domain]) byDomain[domain] = [];
		byDomain[domain].push(inst);
	}

	const lines = [];

	// Header
	lines.push("");
	lines.push("=".repeat(60));
	lines.push(`  INSTINCT STATUS - ${instincts.length} total`);
	lines.push("=".repeat(60));
	lines.push("");

	// Summary by source
	const personal = instincts.filter((i) => i._sourceType === "personal");
	const inherited = instincts.filter((i) => i._sourceType === "inherited");
	lines.push(`  Personal:  ${personal.length}`);
	lines.push(`  Inherited: ${inherited.length}`);
	lines.push("");

	// Print by domain
	for (const domain of Object.keys(byDomain).sort()) {
		const domainInstincts = byDomain[domain];
		lines.push(`## ${domain.toUpperCase()} (${domainInstincts.length})`);
		lines.push("");

		// Sort by confidence descending
		domainInstincts.sort(
			(a, b) => (b.confidence || 0.5) - (a.confidence || 0.5),
		);

		for (const inst of domainInstincts) {
			const conf = inst.confidence || 0.5;
			const confBar = formatConfidenceBar(conf);
			const trigger = inst.trigger || "unknown trigger";

			lines.push(
				`  ${confBar} ${Math.round(conf * 100)
					.toString()
					.padStart(3)}%  ${inst.id}`,
			);
			lines.push(`            trigger: ${trigger}`);

			// Extract action from content
			const content = inst.content || "";
			const actionMatch = content.match(
				/## Action\s*\n\s*(.+?)(?:\n\n|\n##|$)/s,
			);
			if (actionMatch) {
				let action = actionMatch[1].trim().split("\n")[0];
				if (action.length > 60) action = `${action.slice(0, 60)}...`;
				lines.push(`            action: ${action}`);
			}

			lines.push("");
		}
	}

	// Observations stats
	const obsContent = readFile(OBSERVATIONS_FILE);
	if (obsContent) {
		const obsCount = obsContent.split("\n").filter((l) => l.trim()).length;
		lines.push("─".repeat(57));
		lines.push(`  Observations: ${obsCount} events logged`);
		lines.push(`  File: ${OBSERVATIONS_FILE}`);
	}

	lines.push("");
	lines.push("=".repeat(60));
	lines.push("");

	return lines.join("\n");
}

// ─────────────────────────────────────────
// Status Command
// ─────────────────────────────────────────

/**
 * Run status command.
 */
function cmdStatus() {
	const instincts = loadAllInstincts();
	console.log(formatStatus(instincts));
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────

function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	switch (command) {
		case "status":
			cmdStatus();
			break;
		case "import":
		case "export":
		case "evolve":
			log(`Command '${command}' not yet implemented (Phase 4).`);
			process.exit(1);
			break;
		default:
			console.log(
				"Instinct CLI - Continuous Learning v2\n\nCommands:\n  status   Show all instincts and their status\n  import   Import instincts from file or URL (Phase 4)\n  export   Export instincts to file (Phase 4)\n  evolve   Cluster instincts into skills (Phase 4)\n\nUsage:\n  node instinct-cli.js status\n",
			);
			process.exit(command ? 1 : 0);
	}
}

// Run if executed directly
const isMain = process.argv[1]?.endsWith("instinct-cli.js");
if (isMain) {
	main();
}
