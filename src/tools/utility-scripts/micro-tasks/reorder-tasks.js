#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TaskReorderer {
	constructor() {
		this.program = new Command();
		this.setupCLI();
	}

	setupCLI() {
		this.program
			.name("reorder-tasks")
			.description(
				"Deterministic task reordering tool for micro-intents JSON files",
			)
			.version("1.0.0")
			.option("-f, --file <path>", "Path to JSON file containing tasks")
			.option(
				"--order <order>",
				'Task order as comma-separated IDs (e.g., "1,3,2,4,5")',
			)
			.option(
				"-o, --output <path>",
				"Output file path (defaults to overwriting input)",
			)
			.option("--backup", "Create backup before modifying")
			.option("--dry-run", "Show what would be changed without modifying files")
			.option("--strict", "Force strict mode (require all task IDs in order)");
	}

	parseTaskOrder(orderString) {
		// Parse comma-separated task IDs like "1,3,2,4,5"
		const taskIds = orderString
			.split(",")
			.map((id) => parseInt(id.trim(), 10))
			.filter((id) => !Number.isNaN(id));

		if (taskIds.length === 0) {
			throw new Error(
				`Invalid task order: "${orderString}". Expected comma-separated task IDs like "1,3,2,4,5"`,
			);
		}

		return taskIds;
	}

	validateTaskStructure(data) {
		if (!data.tasks || !Array.isArray(data.tasks)) {
			throw new Error('JSON must contain a "tasks" array');
		}

		for (const task of data.tasks) {
			if (!task.id || typeof task.id !== "number") {
				throw new Error(`Task missing valid id: ${JSON.stringify(task)}`);
			}
		}

		// Check for duplicate IDs
		const ids = data.tasks.map((t) => t.id);
		const uniqueIds = new Set(ids);
		if (ids.length !== uniqueIds.size) {
			throw new Error("Duplicate task IDs found");
		}

		return true;
	}

	reorderTasks(data, orderString, options = {}) {
		this.validateTaskStructure(data);

		const desiredOrder = this.parseTaskOrder(orderString);

		// Create a copy to work with
		const result = JSON.parse(JSON.stringify(data));
		const tasks = result.tasks;

		// Validate all task IDs exist
		for (const taskId of desiredOrder) {
			const task = tasks.find((t) => t.id === taskId);
			if (!task) {
				throw new Error(`Task ${taskId} not found`);
			}
		}

		// Determine if this is partial or full reordering
		const existingTaskIds = tasks.map((t) => t.id);
		const isFullReordering = desiredOrder.length === existingTaskIds.length;
		const isPartialReordering = desiredOrder.length < existingTaskIds.length;

		if (desiredOrder.length > existingTaskIds.length) {
			throw new Error("More task IDs provided than exist in the file");
		}

		// Handle strict mode
		if (options.strict && isPartialReordering) {
			throw new Error(
				"Task order must include all existing task IDs (strict mode enabled)",
			);
		}

		let reorderedTasks;

		if (isFullReordering) {
			// Full reordering - existing behavior
			const existingTaskIdsSorted = [...existingTaskIds].sort((a, b) => a - b);
			const orderedTaskIdsSorted = [...desiredOrder].sort((a, b) => a - b);

			if (
				JSON.stringify(existingTaskIdsSorted) !==
				JSON.stringify(orderedTaskIdsSorted)
			) {
				throw new Error("Task order must include all existing task IDs");
			}

			reorderedTasks = desiredOrder.map((taskId) => {
				return tasks.find((t) => t.id === taskId);
			});
		} else {
			// Partial reordering - new behavior
			reorderedTasks = this.performPartialReordering(tasks, desiredOrder);
		}

		// Update nextTask and previousTask references
		this.updateTaskReferences(reorderedTasks);

		// Update dependsOn arrays to maintain logical consistency
		this.updateDependsOnReferences(reorderedTasks);

		result.tasks = reorderedTasks;
		return result;
	}

	performPartialReordering(tasks, desiredOrder) {
		// Validate input
		if (desiredOrder.length === 0) {
			throw new Error("Partial order cannot be empty");
		}

		// Check for duplicate IDs in desired order
		const duplicates = desiredOrder.filter(
			(id, index) => desiredOrder.indexOf(id) !== index,
		);
		if (duplicates.length > 0) {
			throw new Error(`Duplicate task IDs in order: ${duplicates.join(", ")}`);
		}

		// Find current positions of all tasks
		const taskPositions = new Map();
		tasks.forEach((task, index) => {
			taskPositions.set(task.id, index);
		});

		// The first task in the desired order becomes the anchor
		const anchorTaskId = desiredOrder[0];
		const anchorPosition = taskPositions.get(anchorTaskId);

		// Get all task IDs that are NOT in the desired order
		const desiredSet = new Set(desiredOrder);
		const unchangedTasks = tasks.filter((task) => !desiredSet.has(task.id));

		// Split unchanged tasks into before and after anchor
		const tasksBeforeAnchor = unchangedTasks.filter(
			(task) => taskPositions.get(task.id) < anchorPosition,
		);
		const tasksAfterAnchor = unchangedTasks.filter(
			(task) => taskPositions.get(task.id) > anchorPosition,
		);

		// Get the actual task objects for the desired order
		const reorderedSequence = desiredOrder.map((taskId) =>
			tasks.find((t) => t.id === taskId),
		);

		// Combine: tasks before anchor + reordered sequence + tasks after anchor
		const result = [
			...tasksBeforeAnchor,
			...reorderedSequence,
			...tasksAfterAnchor,
		];

		return result;
	}

	updateTaskReferences(tasks) {
		// Update nextTask and previousTask based on new order
		for (let i = 0; i < tasks.length; i++) {
			const currentTask = tasks[i];
			const previousTask = i > 0 ? tasks[i - 1] : null;
			const nextTask = i < tasks.length - 1 ? tasks[i + 1] : null;

			currentTask.previousTask = previousTask ? previousTask.id : null;
			currentTask.nextTask = nextTask ? nextTask.id : null;
		}
	}

	updateDependsOnReferences(tasks) {
		// Build task ID to new position mapping
		const taskIdToPosition = new Map();
		const taskIdSet = new Set();

		tasks.forEach((task, index) => {
			taskIdToPosition.set(task.id, index);
			taskIdSet.add(task.id);
		});

		// Update dependsOn arrays for each task
		for (const task of tasks) {
			if (task.dependsOn && Array.isArray(task.dependsOn.ids)) {
				// Filter out any dependsOn IDs that no longer exist in the task list
				const validDependencies = task.dependsOn.ids.filter((id) =>
					taskIdSet.has(id),
				);

				// Check for circular dependencies
				if (this.hasCircularDependency(task.id, validDependencies, tasks)) {
					throw new Error(`Circular dependency detected for task ${task.id}`);
				}

				// Update the dependsOn.ids array with filtered valid dependencies
				task.dependsOn.ids = validDependencies;
				// Preserve dependsOn.reasoning text - no changes needed
			}
		}
	}

	hasCircularDependency(taskId, dependencies, tasks) {
		// Create adjacency map for dependency graph
		const dependencyMap = new Map();

		tasks.forEach((task) => {
			if (task.dependsOn && Array.isArray(task.dependsOn.ids)) {
				dependencyMap.set(task.id, task.dependsOn.ids);
			} else {
				dependencyMap.set(task.id, []);
			}
		});

		// Use DFS to detect cycles
		const visited = new Set();
		const recursionStack = new Set();

		const hasCycle = (currentTaskId) => {
			if (recursionStack.has(currentTaskId)) {
				return true; // Back edge found - cycle detected
			}
			if (visited.has(currentTaskId)) {
				return false; // Already processed
			}

			visited.add(currentTaskId);
			recursionStack.add(currentTaskId);

			const deps = dependencyMap.get(currentTaskId) || [];
			for (const depId of deps) {
				if (hasCycle(depId)) {
					return true;
				}
			}

			recursionStack.delete(currentTaskId);
			return false;
		};

		// Check if adding these dependencies to taskId would create a cycle
		const tempDependencyMap = new Map(dependencyMap);
		tempDependencyMap.set(taskId, dependencies);

		// Reset tracking sets and check for cycles from this task
		visited.clear();
		recursionStack.clear();

		return hasCycle(taskId);
	}

	async createBackup(filePath) {
		const backupPath = `${filePath}.backup.${Date.now()}`;
		await fs.copy(filePath, backupPath);
		console.log(`Backup created: ${backupPath}`);
		return backupPath;
	}

	async processFile(inputPath, outputPath, orderString, options = {}) {
		try {
			// Read and parse JSON
			const data = await fs.readJson(inputPath);

			// Create backup if requested
			if (options.backup && inputPath === outputPath) {
				await this.createBackup(inputPath);
			}

			// Reorder tasks
			const result = this.reorderTasks(data, orderString, options);

			if (options.dryRun) {
				console.log("Dry run - would make the following changes:");
				console.log(JSON.stringify(result, null, 2));
				return result;
			}

			// Write result
			await fs.writeJson(outputPath, result, { spaces: 2 });
			console.log(
				`Tasks reordered successfully. Output written to: ${outputPath}`,
			);

			return result;
		} catch (error) {
			console.error("Error processing file:", error.message);
			throw error;
		}
	}

	async run() {
		this.program.parse();
		const options = this.program.opts();

		if (!options.file || !options.order) {
			console.error("Error: Both --file and --order options are required");
			this.program.help();
			return;
		}

		const inputPath = path.resolve(options.file);
		const outputPath = options.output
			? path.resolve(options.output)
			: inputPath;

		if (!(await fs.pathExists(inputPath))) {
			console.error(`Error: Input file does not exist: ${inputPath}`);
			return;
		}

		await this.processFile(inputPath, outputPath, options.order, {
			backup: options.backup,
			dryRun: options.dryRun,
			strict: options.strict,
		});
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	const reorderer = new TaskReorderer();
	reorderer.run().catch((error) => {
		console.error("Fatal error:", error.message);
		process.exit(1);
	});
}

export default TaskReorderer;
