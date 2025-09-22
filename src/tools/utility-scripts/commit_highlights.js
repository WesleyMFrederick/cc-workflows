#!/usr/bin/env node
/**
 * Commit Highlights Tool for LLM-Generated Content
 *
 * This script removes <mark> tags from specified group IDs while preserving the content inside.
 * Designed for Task agents and LLMs to commit their approved highlights in walkthrough documents.
 *
 * Usage:
 *     node commit_highlights.js <file_path> <group_id>
 *     node commit_highlights.js <file_path> --all
 *
 * Examples:
 *     node commit_highlights.js interceptor-ts-deep-dive.md response-20250623103000
 *     node commit_highlights.js walkthrough-claude-trace-development.md --all
 */

import fs from "node:fs";

/**
 * Remove all <mark> tags for a specific group ID while preserving content.
 *
 * @param {string} content - File content as string
 * @param {string} groupId - The group ID to remove (e.g., "response-20250623103000")
 * @returns {string} Content with specified group's mark tags removed
 */
function removeGroupHighlights(content, groupId) {
	// Escape special regex characters in group ID
	const escapedGroupId = groupId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

	// Remove HTML comment delimiters for the group
	content = content.replace(
		new RegExp(`<!-- group-id:${escapedGroupId} -->\\n?`, "g"),
		"",
	);
	content = content.replace(
		new RegExp(`<!-- /group-id:${escapedGroupId} -->\\n?`, "g"),
		"",
	);

	// Remove mark tags with the specific group ID, preserving content
	const pattern = new RegExp(
		`<mark[^>]*data-group-id="${escapedGroupId}"[^>]*>(.*?)</mark>`,
		"gs",
	);
	content = content.replace(pattern, "$1");

	return content;
}

/**
 * Remove ALL <mark> tags while preserving content.
 *
 * @param {string} content - File content as string
 * @returns {string} Content with all mark tags removed
 */
function removeAllHighlights(content) {
	// Remove all HTML comment group delimiters
	content = content.replace(/<!-- group-id:[^>]+ -->\n?/g, "");
	content = content.replace(/<!-- \/group-id:[^>]+ -->\n?/g, "");

	// Remove all mark tags, preserving content
	content = content.replace(/<mark[^>]*>(.*?)<\/mark>/gs, "$1");

	return content;
}

/**
 * Find all group IDs in the content.
 *
 * @param {string} content - File content as string
 * @returns {string[]} List of group IDs found in the content
 */
function findGroupIds(content) {
	const pattern = /data-group-id="([^"]+)"/g;
	const matches = [];
	let match;

	match = pattern.exec(content);
	while (match !== null) {
		matches.push(match[1]);
		match = pattern.exec(content);
	}

	// Remove duplicates
	return [...new Set(matches)];
}

/**
 * Print usage information
 */
function printUsage() {
	console.log(`
Usage: node commit_highlights.js <file_path> [group_id|--all] [options]

Arguments:
  file_path               Path to the markdown file
  group_id               Group ID to commit (e.g., response-20250623103000)

Options:
  --all                  Remove all highlight marks
  --list                 List all group IDs in the file
  --dry-run              Show what would be changed without modifying file
  --help, -h             Show this help message

Examples:
  node commit_highlights.js interceptor-ts-deep-dive.md response-20250623103000
  node commit_highlights.js walkthrough-claude-trace-development.md --all
  node commit_highlights.js --list interceptor-ts-deep-dive.md
`);
}

function main() {
	const args = process.argv.slice(2);

	// Parse arguments
	if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
		printUsage();
		process.exit(0);
	}

	const filePath = args[0];
	const groupId = args[1];
	const isAll = args.includes("--all");
	const isList = args.includes("--list");
	const isDryRun = args.includes("--dry-run");

	// Validate file path
	if (!fs.existsSync(filePath)) {
		console.error(`Error: File ${filePath} does not exist`);
		process.exit(1);
	}

	// Read file content
	let content;
	try {
		content = fs.readFileSync(filePath, "utf-8");
	} catch (error) {
		console.error(`Error reading file: ${error.message}`);
		process.exit(1);
	}

	// List group IDs if requested
	if (isList) {
		const groupIds = findGroupIds(content);
		if (groupIds.length > 0) {
			console.log("Found group IDs:");
			groupIds.sort().forEach((gid) => {
				console.log(`  - ${gid}`);
			});
		} else {
			console.log("No group IDs found in file");
		}
		return;
	}

	// Validate arguments
	if (!isAll && !groupId) {
		console.error("Error: Must specify either a group_id or --all");
		printUsage();
		process.exit(1);
	}

	if (isAll && groupId && !["--all", "--dry-run", "--list"].includes(groupId)) {
		console.error("Error: Cannot specify both group_id and --all");
		process.exit(1);
	}

	// Process content
	let newContent;
	if (isAll) {
		console.log(`Removing ALL highlight marks from ${filePath}`);
		newContent = removeAllHighlights(content);
	} else {
		console.log(`Removing highlights for group '${groupId}' from ${filePath}`);
		newContent = removeGroupHighlights(content, groupId);
	}

	// Check if any changes were made
	if (content === newContent) {
		if (isAll) {
			console.log("No highlight marks found to remove");
		} else {
			console.log(`No highlights found for group '${groupId}'`);
		}
		return;
	}

	// Show changes or write file
	if (isDryRun) {
		console.log("\n--- CHANGES (dry run) ---");
		// Simple diff indication
		const originalMarks = (content.match(/<mark[^>]*>/g) || []).length;
		const newMarks = (newContent.match(/<mark[^>]*>/g) || []).length;
		console.log(`Would remove ${originalMarks - newMarks} mark tags`);

		// Show sample of what would be removed
		if (groupId && !isAll) {
			const escapedGroupId = groupId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const pattern = new RegExp(
				`<mark[^>]*data-group-id="${escapedGroupId}"[^>]*>`,
				"g",
			);
			const sampleMarks = content.match(pattern);
			if (sampleMarks && sampleMarks.length > 0) {
				const sample =
					sampleMarks[0].length > 100
						? `${sampleMarks[0].substring(0, 100)}...`
						: sampleMarks[0];
				console.log(`Sample mark to be removed: ${sample}`);
			}
		}
	} else {
		// Write the modified content back to file
		try {
			fs.writeFileSync(filePath, newContent, "utf-8");

			const originalMarks = (content.match(/<mark[^>]*>/g) || []).length;
			const newMarks = (newContent.match(/<mark[^>]*>/g) || []).length;
			console.log(
				`✅ Successfully removed ${originalMarks - newMarks} mark tags`,
			);
		} catch (error) {
			console.error(`Error writing file: ${error.message}`);
			process.exit(1);
		}
	}
}

// ES modules don't have require.main, so we check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export { removeGroupHighlights, removeAllHighlights, findGroupIds };
