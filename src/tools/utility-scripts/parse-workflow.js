#!/usr/bin/env node

import fs from "node:fs";
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
 * Load and parse workflow YAML definition
 * @param {string} workflowPath - Path to workflow YAML file
 * @returns {Object} - Parsed workflow definition
 */
function loadWorkflowDefinition(workflowPath) {
	if (!fs.existsSync(workflowPath)) {
		throw new Error(`Workflow file not found: ${workflowPath}`);
	}

	const content = fs.readFileSync(workflowPath, "utf8");
	return yaml.parse(content);
}

/**
 * Discover and analyze existing stories in the project
 * @param {Object} configData - Config data containing devStoryLocation
 * @returns {Object} - {draftStory: string|null, activeStories: Array, nextStory: string}
 */
function discoverProjectStories(configData) {
	const storyLocation = configData.devStoryLocation;
	if (!storyLocation || !fs.existsSync(storyLocation)) {
		return { draftStory: null, activeStories: [], nextStory: "1.1" };
	}

	// Find all story files matching pattern {epic}.{story}.*.story.md
	const storyFiles = fs
		.readdirSync(storyLocation)
		.filter((file) => file.endsWith(".story.md") && /^\d+\.\d+\./.test(file))
		.sort();

	if (storyFiles.length === 0) {
		return { draftStory: null, activeStories: [], nextStory: "1.1" };
	}

	const stories = [];
	let draftStory = null;
	const activeStories = [];

	// Parse each story file to get status
	for (const file of storyFiles) {
		const filePath = `${storyLocation}/${file}`;
		try {
			const { frontMatter } = parseFrontMatter(filePath);
			const [epic, story] = file.split(".").slice(0, 2).map(Number);

			const storyInfo = {
				file: filePath,
				epic,
				story,
				status: frontMatter.status || "Unknown",
			};

			stories.push(storyInfo);

			// Find lowest draft story
			if (frontMatter.status === "Draft" && !draftStory) {
				draftStory = filePath;
			}

			// Collect active development stories
			if (
				["In Progress", "Development", "InProgress"].includes(
					frontMatter.status,
				)
			) {
				activeStories.push(storyInfo);
			}
		} catch (error) {
			console.warn(`Warning: Could not parse ${filePath}: ${error.message}`);
		}
	}

	// Determine next story number
	const maxStory = stories.reduce(
		(max, s) => (s.epic === 1 ? Math.max(max, s.story) : max),
		0,
	);
	const nextStory = `1.${maxStory + 1}`;

	return { draftStory, activeStories, nextStory, allStories: stories };
}

/**
 * Parse Known Issues section to extract routing information
 * @param {string} content - Story file content
 * @returns {string|null} - Agent name to route to, or null if no routing needed
 */
function parseKnownIssuesForRouting(content) {
	// Extract Known Issues section from QA Results or similar sections
	const knownIssuesMatch = content.match(
		/#### Known Issues\n([\s\S]*?)(?=\n### |$)/,
	);
	if (!knownIssuesMatch) {
		return null;
	}

	const knownIssuesSection = knownIssuesMatch[1];

	// Look for first issue requiring routing (Open or Resolved status)
	const issueBlocks = knownIssuesSection.split(/\n(?=- \*\*Issue Type\*\*)/);

	for (const block of issueBlocks) {
		// Check if this issue is Open (route to Owner Agent) or Resolved (route to Validator Agent)
		const statusMatch = block.match(/- \*\*Status\*\*: (Open|Resolved)/);
		if (!statusMatch) continue;

		const status = statusMatch[1];

		if (status === "Open") {
			// Route to Owner Agent (who should fix the issue)
			const ownerAgentMatch = block.match(/- \*\*Owner Agent\*\*: (.+)/);
			if (ownerAgentMatch) {
				return ownerAgentMatch[1].trim();
			}
		} else if (status === "Resolved") {
			// Issues are resolved - no more fix routing needed
			// Let workflow handle on-success routing per YAML definition
			return null;
		}
	}

	return null;
}

/**
 * Check if Known Issues section contains only resolved issues (fix-issue success condition)
 * @param {string} content - Story file content
 * @returns {boolean} - True if Known Issues exist and all have Status: Resolved
 */
function checkForResolvedIssues(content) {
	// Extract Known Issues section
	const knownIssuesMatch = content.match(
		/#### Known Issues\n([\s\S]*?)(?=\n### |$)/,
	);
	if (!knownIssuesMatch) {
		return false; // No Known Issues section
	}

	const knownIssuesSection = knownIssuesMatch[1];
	const issueBlocks = knownIssuesSection.split(/\n(?=- \*\*Issue Type\*\*)/);

	let hasIssues = false;
	for (const block of issueBlocks) {
		if (block.trim() === "") continue;

		const statusMatch = block.match(/- \*\*Status\*\*: (Open|Resolved)/);
		if (statusMatch) {
			hasIssues = true;
			const status = statusMatch[1];
			if (status !== "Resolved") {
				return false; // Found an issue that's not resolved
			}
		}
	}

	return hasIssues; // Return true only if we found issues and all are resolved
}

/**
 * Parse story file to extract current workflow state from Task checkboxes
 * @param {string} storyPath - Path to story markdown file (optional)
 * @returns {Object} - Current workflow state information
 */
function parseWorkflowState(storyPath) {
	// If no story file provided, return empty state (for story creation workflows)
	if (!storyPath) {
		return { completedSteps: [], retryCount: 0 };
	}

	const { content } = parseFrontMatter(storyPath);

	// Extract Tasks/Subtasks section
	const tasksMatch = content.match(
		/## Tasks \/ Subtasks\n([\s\S]*?)(?=\n## |$)/,
	);
	if (!tasksMatch) {
		return { completedSteps: [], currentStep: null, retryCount: 0 };
	}

	const tasksSection = tasksMatch[1];

	// Parse checkbox states to determine completed workflow steps
	const completedSteps = [];
	const taskLines = tasksSection.split("\n");

	for (const line of taskLines) {
		// Look for workflow step markers in format: - [x] StepName (Workflow: workflow-name)
		const workflowTaskMatch = line.match(
			/- \[([x ])\] (.+?) \(Workflow: (.+?)\)/,
		);
		if (workflowTaskMatch) {
			const [, status, stepName, workflowName] = workflowTaskMatch;
			if (status === "x") {
				completedSteps.push({ stepName, workflowName });
			}
		}
	}

	// Extract retry count from story content (simple implementation)
	const retryMatch = content.match(/Retry Count: (\d+)/);
	const retryCount = retryMatch ? parseInt(retryMatch[1], 10) : 0;

	// Extract routing information from Known Issues section
	const routeToAgent = parseKnownIssuesForRouting(content);

	// Check if fix-issue step just completed with resolved issues
	const hasResolvedIssues = checkForResolvedIssues(content);

	return { completedSteps, retryCount, routeToAgent, hasResolvedIssues };
}

/**
 * Determine next workflow step based on current state and workflow definition
 * @param {Object} workflowDef - Workflow definition object
 * @param {Object} currentState - Current workflow state
 * @param {Object} options - Command line options including routing overrides
 * @returns {Object} - Next step information or completion status
 */
function determineNextStep(workflowDef, currentState, options = {}) {
	const { steps } = workflowDef;
	const { completedSteps, routeToAgent, hasResolvedIssues } = currentState;

	// Check for manual routing override (--route-to)
	if (options.routeTo) {
		const targetStep = steps.find((step) => step.id === options.routeTo);
		if (targetStep) {
			console.log(
				`🔄 Manual routing to step: ${targetStep.id} (${targetStep.agent})`,
			);
			return {
				action: "manual-route",
				step: targetStep,
				isComplete: false,
				routing: true,
			};
		} else {
			console.warn(
				`⚠️  Cannot route to step '${options.routeTo}' - step not found in workflow`,
			);
		}
	}

	// Check for on-success routing (fix-issue completed with resolved issues)
	if (hasResolvedIssues && !routeToAgent) {
		// Find completed step IDs to check if fix-issue was recently completed
		const completedStepIds = completedSteps.map((step) =>
			step.stepName.toLowerCase().replace(/\s+/g, "-"),
		);

		// If fix-issue step is completed and all issues are resolved, route per on-success
		if (completedStepIds.includes("fix-issue")) {
			const fixIssueStep = steps.find((step) => step.id === "fix-issue");
			if (fixIssueStep?.["on-success"]?.["route-to"]) {
				const onSuccessStepId = fixIssueStep["on-success"]["route-to"];
				const onSuccessStep = steps.find((step) => step.id === onSuccessStepId);
				if (onSuccessStep) {
					console.log(
						`🔄 On-success routing from fix-issue to ${onSuccessStepId} (all issues resolved)`,
					);
					return {
						action: "on-success-route",
						step: onSuccessStep,
						isComplete: false,
						routing: true,
					};
				}
			}
		}
	}

	// Check for agent routing (validation failure routing from Known Issues)
	if (routeToAgent) {
		// First try to find a fix-issue step for Known Issues routing
		const fixIssueStep = steps.find((step) => step.id === "fix-issue");
		if (fixIssueStep) {
			console.log(
				`🔄 Routing to fix-issue step with ${routeToAgent} agent based on Known Issues`,
			);
			return {
				action: "route-to-fix-issue",
				step: fixIssueStep,
				dynamicAgent: routeToAgent,
				isComplete: false,
				routing: true,
			};
		}

		// Fallback to original logic for workflows without fix-issue step
		const targetStep = steps.find((step) => step.agent === routeToAgent);
		if (targetStep) {
			console.log(
				`🔄 Routing to ${targetStep.agent} agent based on Known Issues (${targetStep.id})`,
			);
			return {
				action: "route-to-agent",
				step: targetStep,
				isComplete: false,
				routing: true,
			};
		} else {
			console.warn(
				`⚠️  Cannot route to agent '${routeToAgent}' - no fix-issue step or matching workflow step found`,
			);
		}
	}

	// Find completed step IDs
	const completedStepIds = completedSteps.map((step) =>
		step.stepName.toLowerCase().replace(/\s+/g, "-"),
	);

	// Find first incomplete step (normal linear progression)
	for (const step of steps) {
		if (!completedStepIds.includes(step.id)) {
			return {
				action: "execute-step",
				step: step,
				isComplete: false,
			};
		}
	}

	// All steps completed
	return {
		action: "workflow-complete",
		step: null,
		isComplete: true,
	};
}

/**
 * Generate Task tool call for orchestrator agent
 * @param {Object} step - Workflow step definition
 * @param {string} storyPath - Path to story file (optional)
 * @param {Object} workflowDef - Workflow definition
 * @param {number} retryCount - Current retry count
 * @param {Object} configData - Config data when no story file (optional)
 * @param {string} agentOverride - Optional agent override from command line
 * @returns {Object} - Task tool call specification
 */
function generateTaskCall(
	step,
	storyPath,
	_workflowDef,
	retryCount,
	configData = null,
	agentOverride = null,
) {
	// Use agent override if provided, otherwise use step's default agent
	const selectedAgent = agentOverride || step.agent;

	// Generate parse-prompt.js command for this step
	let parsePromptCmd;
	if (storyPath) {
		// Use story file
		parsePromptCmd = [
			"node utility-scripts/parse-prompt.js",
			`agentic-workflows/tasks/${step["task-template"]}`,
			storyPath,
			selectedAgent,
		].join(" ");
	} else {
		// Use config file (for story creation workflows)
		// Pass discovered story information as key-value arguments
		const storyArgs = [];
		if (configData?.devStoryLocation) {
			const storyAnalysis = discoverProjectStories(configData);
			if (storyAnalysis.nextStory) {
				const [epic, story] = storyAnalysis.nextStory.split(".");
				storyArgs.push(`epicNum=${epic}`, `storyNum=${story}`);

				// Extract story title from PRD using deterministic parsing (Design Principle 4)
				const storyTitleSlug = extractStoryTitleFromPRD(
					configData,
					epic,
					story,
				);
				storyArgs.push(`story_title_slug=${storyTitleSlug}`);
			}
		}

		parsePromptCmd = [
			"node utility-scripts/parse-prompt.js",
			`agentic-workflows/tasks/${step["task-template"]}`,
			"agentic-workflows/config.yaml",
			selectedAgent,
			...storyArgs,
		].join(" ");
	}

	return {
		tool: "Task",
		subagent_type: selectedAgent,
		description: `Execute ${step.name} (${step.id}) - Attempt ${retryCount + 1}`,
		prompt: parsePromptCmd,
	};
}

/**
 * Update story file with workflow step completion
 * @param {string} storyPath - Path to story file
 * @param {Object} step - Completed workflow step
 * @param {string} workflowName - Name of workflow
 * @param {string} status - Completion status (success/fail)
 */
function updateStoryProgress(storyPath, step, workflowName, status) {
	const content = fs.readFileSync(storyPath, "utf8");

	// Find Tasks/Subtasks section
	const tasksMatch = content.match(
		/(## Tasks \/ Subtasks\n)([\s\S]*?)(?=\n## |$)/,
	);
	if (!tasksMatch) {
		throw new Error("Tasks/Subtasks section not found in story file");
	}

	const [, sectionHeader, tasksContent] = tasksMatch;
	const checkboxStatus = status === "success" ? "x" : " ";
	const timestamp = new Date().toISOString().split("T")[0];

	// Add or update workflow step entry
	const stepEntry = `- [${checkboxStatus}] ${step.name} (Workflow: ${workflowName}) - ${timestamp}`;

	// Check if this step already exists
	const existingStepRegex = new RegExp(
		`- \\[[x ]\\] ${step.name} \\(Workflow: ${workflowName}\\).*`,
	);

	let updatedTasksContent;
	if (existingStepRegex.test(tasksContent)) {
		// Update existing step
		updatedTasksContent = tasksContent.replace(existingStepRegex, stepEntry);
	} else {
		// Add new step
		updatedTasksContent = `${tasksContent.trim()}\n${stepEntry}`;
	}

	// Replace Tasks/Subtasks content
	let updatedContent = content.replace(
		tasksMatch[0],
		`${sectionHeader + updatedTasksContent}\n`,
	);

	// Auto-update Known Issues status when fix-issue step completes successfully
	if (step.id === "fix-issue" && status === "success") {
		// Find Known Issues section using same regex as parseKnownIssuesForRouting()
		const knownIssuesMatch = updatedContent.match(
			/#### Known Issues\n([\s\S]*?)(?=\n### |$)/,
		);

		if (knownIssuesMatch) {
			const [fullMatch, knownIssuesSection] = knownIssuesMatch;

			// Update all "Status: Open" to "Status: Resolved" within the section
			const updatedKnownIssuesSection = knownIssuesSection.replace(
				/- \*\*Status\*\*: Open/g,
				"- **Status**: Resolved",
			);

			// Replace the Known Issues section with updated status
			updatedContent = updatedContent.replace(
				fullMatch,
				`#### Known Issues\n${updatedKnownIssuesSection}`,
			);

			console.log("✅ Auto-updated Known Issues status: Open → Resolved");
		}
	}

	fs.writeFileSync(storyPath, updatedContent);
}

/**
 * Extract story title from PRD file and convert to kebab-case slug
 * Implements Design Principle 4 (Deterministic Offloading) by mechanically parsing PRD structure
 * @param {Object} configData - Configuration data containing PRD location
 * @param {string} epicNum - Epic number (e.g., "1")
 * @param {string} storyNum - Story number (e.g., "4")
 * @returns {string} - Kebab-case slug of story title (e.g., "ui-integration")
 */
function extractStoryTitleFromPRD(configData, epicNum, storyNum) {
	if (
		!configData ||
		!configData.prd ||
		!configData.prd.prdShardedLocation ||
		!configData.prd.epicFilePattern
	) {
		console.warn("PRD configuration missing, using fallback story slug");
		return `story-${epicNum}-${storyNum}`;
	}

	try {
		// Construct PRD epic file path using pattern
		const epicPattern = configData.prd.epicFilePattern.replace("{n}", epicNum);
		const prdDir = configData.prd.prdShardedLocation;

		// Find matching epic file
		const epicFiles = fs
			.readdirSync(prdDir)
			.filter((file) => file.match(new RegExp(epicPattern.replace("*", ".*"))));

		if (epicFiles.length === 0) {
			console.warn(`No PRD epic file found matching pattern ${epicPattern}`);
			return `story-${epicNum}-${storyNum}`;
		}

		const epicFilePath = `${prdDir}/${epicFiles[0]}`;
		const prdContent = fs.readFileSync(epicFilePath, "utf8");

		// Parse story title using deterministic pattern: ## Story {epic}.{story}: {title}
		const storyPattern = new RegExp(
			`^## Story ${epicNum}\\.${storyNum}: (.+)$`,
			"m",
		);
		const storyMatch = prdContent.match(storyPattern);

		if (!storyMatch) {
			console.warn(
				`Story ${epicNum}.${storyNum} not found in PRD file ${epicFilePath}`,
			);
			return `story-${epicNum}-${storyNum}`;
		}

		const storyTitle = storyMatch[1].trim();

		// Convert to kebab-case slug (deterministic transformation)
		const slug = storyTitle
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

		return slug;
	} catch (error) {
		console.warn(`Error extracting story title from PRD: ${error.message}`);
		return `story-${epicNum}-${storyNum}`;
	}
}

/**
 * Update story file status in front matter
 * @param {string} storyPath - Path to story file
 * @param {string} newStatus - New status to set
 */
function updateStoryStatus(storyPath, newStatus) {
	let content = fs.readFileSync(storyPath, "utf8");

	// Find and update the status line in the front matter
	const statusRegex = /^(status:\s*).+$/m;
	if (statusRegex.test(content)) {
		// Update existing status
		content = content.replace(statusRegex, `$1${newStatus}`);
	} else {
		// Add status after front matter opening if not found
		content = content.replace(/^---\n/, `---\nstatus: ${newStatus}\n`);
	}

	fs.writeFileSync(storyPath, content);
}

/**
 * Display help information
 */
function showHelp() {
	console.log(`
Workflow Parser and Orchestration Tool

Usage:
  node parse-workflow.js <workflow-file> [story-file] [options]

Arguments:
  workflow-file    Path to workflow YAML definition (e.g., agentic-workflows/workflows/tdd-workflow.yaml)
  story-file       Path to user story markdown file (optional - omit for story creation workflows)

Options:
  --current-step   Force specific workflow step (for testing)
  --retry-count    Set retry count for current step
  --update-step    Update story with step completion (requires --status)
  --status         Status for step update (success/fail)
  --agent          Override default agent for workflow step (e.g., frontend-developer-agent)
  --route-to       Force routing to specific step ID (overrides Known Issues routing)
  --help           Show this help message

Examples:
  # Determine next workflow step for existing story
  node parse-workflow.js agentic-workflows/workflows/tdd-workflow.yaml docs/stories/1.1.story.md

  # Use frontend agent for implementation step instead of default backend agent
  node parse-workflow.js agentic-workflows/workflows/tdd-workflow.yaml docs/stories/1.1.story.md --agent=frontend-developer-agent

  # Draft next story (no existing story file needed)
  node parse-workflow.js agentic-workflows/workflows/draft-next-user-story-workflow.yaml

  # Update story with step completion
  node parse-workflow.js tdd-workflow.yaml story.md --update-step --status=success

  # Check specific step (testing)
  node parse-workflow.js tdd-workflow.yaml story.md --current-step=step-2

  # Force routing to write-tests step (overrides Known Issues routing)
  node parse-workflow.js tdd-workflow.yaml story.md --route-to=write-tests

The script will:
1. Load workflow definition and parse current story state
2. Determine next workflow step or completion status
3. Generate Task tool call specification for orchestrator
4. Optionally update story file with step completion
`);
}

/**
 * Main function
 */
function main() {
	const args = process.argv.slice(2);

	if (args.includes("--help") || args.length < 1) {
		showHelp();
		process.exit(args.includes("--help") ? 0 : 1);
	}

	const [workflowPath, storyPath] = args;

	// Parse command line options
	const options = {
		currentStep: null,
		retryCount: 0,
		updateStep: false,
		status: null,
		agent: null,
		routeTo: null,
	};

	for (let i = 2; i < args.length; i++) {
		if (args[i].startsWith("--current-step=")) {
			options.currentStep = args[i].split("=")[1];
		} else if (args[i].startsWith("--retry-count=")) {
			options.retryCount = parseInt(args[i].split("=")[1], 10);
		} else if (args[i] === "--update-step") {
			options.updateStep = true;
		} else if (args[i].startsWith("--status=")) {
			options.status = args[i].split("=")[1];
		} else if (args[i].startsWith("--agent=")) {
			options.agent = args[i].split("=")[1];
		} else if (args[i].startsWith("--route-to=")) {
			options.routeTo = args[i].split("=")[1];
		}
	}

	try {
		// Load workflow definition
		const workflowDef = loadWorkflowDefinition(workflowPath);
		console.log(`✅ Loaded workflow: ${workflowDef.workflow.name}`);

		// Load config file when no story file provided and discover stories
		let configData = null;
		let discoveredStoryPath = storyPath;
		let storyAnalysis = null;

		if (!storyPath) {
			const defaultConfigPath = "agentic-workflows/config.yaml";
			if (fs.existsSync(defaultConfigPath)) {
				const parsed = parseConfigFile(defaultConfigPath);
				configData = parsed.frontMatter;
				console.log(`📁 Loaded config file: ${defaultConfigPath}`);

				// Discover existing stories
				storyAnalysis = discoverProjectStories(configData);

				// Check for active development conflicts
				if (storyAnalysis.activeStories.length > 0) {
					console.log(`⚠️  WARNING: Found active development stories:`);
					storyAnalysis.activeStories.forEach((story) => {
						console.log(`   - ${story.epic}.${story.story} (${story.status})`);
					});
					console.log(
						`⚠️  Drafting next story may cause development conflicts.`,
					);
					// For now, continue - in interactive mode this would prompt user
				}

				// Use draft story if available, otherwise proceed with story creation
				if (storyAnalysis.draftStory) {
					discoveredStoryPath = storyAnalysis.draftStory;
					console.log(`📋 Found draft story: ${discoveredStoryPath}`);
				} else {
					console.log(
						`📝 No draft stories found. Next story: ${storyAnalysis.nextStory}`,
					);
				}
			}
		}

		// Parse current workflow state from story (discovered or provided)
		const currentState = parseWorkflowState(discoveredStoryPath);
		console.log(
			`📊 Current state: ${currentState.completedSteps.length} steps completed`,
		);

		// Handle step update if requested
		if (options.updateStep && options.status) {
			if (options.currentStep) {
				const step = workflowDef.steps.find(
					(s) => s.id === options.currentStep,
				);
				if (step) {
					updateStoryProgress(
						discoveredStoryPath,
						step,
						workflowDef.workflow.name,
						options.status,
					);
					console.log(
						`✅ Updated story with step completion: ${step.name} (${options.status})`,
					);

					// After updating step, immediately determine next action
					const updatedState = parseWorkflowState(discoveredStoryPath);
					const nextAction = determineNextStep(
						workflowDef,
						updatedState,
						options,
					);

					if (nextAction.isComplete) {
						// Workflow complete - update story status if defined
						if (
							workflowDef["story-integration"]?.["status-updates"]?.[
								"on-success"
							]
						) {
							const successStatus =
								workflowDef["story-integration"]["status-updates"][
									"on-success"
								];
							updateStoryStatus(discoveredStoryPath, successStatus);
							console.log(`✅ Updated story status to: ${successStatus}`);
						}

						console.log("🎉 Workflow Complete!");
						console.log(
							JSON.stringify(
								{
									action: "workflow-complete",
									workflow: workflowDef.workflow.name,
									totalSteps: workflowDef.steps.length,
									message: "All workflow steps completed successfully",
									storyStatus:
										workflowDef["story-integration"]?.["status-updates"]?.[
											"on-success"
										] || null,
								},
								null,
								2,
							),
						);
					} else {
						// More steps remain - generate next task call
						console.log(
							`🔄 Next Step: ${nextAction.step.name} (${nextAction.step.id})`,
						);

						// Use dynamic agent if routing to fix-issue, otherwise use options.agent
						const effectiveAgent = nextAction.dynamicAgent || options.agent;

						const taskCall = generateTaskCall(
							nextAction.step,
							discoveredStoryPath,
							workflowDef,
							options.retryCount,
							configData,
							effectiveAgent,
						);

						const enrichedTaskCall = {
							...taskCall,
							storyMetadata: null, // No metadata in update-step flow
						};

						console.log("\\n--- Task Tool Call Specification ---");
						console.log(JSON.stringify(enrichedTaskCall, null, 2));
					}
				}
			}
			return;
		}

		// Determine next workflow action
		const nextAction = determineNextStep(workflowDef, currentState, options);

		if (nextAction.isComplete) {
			console.log("🎉 Workflow Complete!");
			console.log(
				JSON.stringify(
					{
						action: "workflow-complete",
						workflow: workflowDef.workflow.name,
						totalSteps: workflowDef.steps.length,
						message: "All workflow steps completed successfully",
					},
					null,
					2,
				),
			);
		} else {
			console.log(
				`🔄 Next Step: ${nextAction.step.name} (${nextAction.step.id})`,
			);

			// Generate Task tool call
			// Use dynamic agent if routing to fix-issue, otherwise use options.agent
			const effectiveAgent = nextAction.dynamicAgent || options.agent;

			const taskCall = generateTaskCall(
				nextAction.step,
				discoveredStoryPath,
				workflowDef,
				options.retryCount,
				configData,
				effectiveAgent,
			);

			// Add story metadata to the task call for self-contained interface
			let storyMetadata = null;
			if (configData) {
				// If we have a discovered story path, extract epic/story numbers from it
				if (discoveredStoryPath) {
					try {
						const { frontMatter } = parseFrontMatter(discoveredStoryPath);
						storyMetadata = {
							epicNum: frontMatter.epicNumber || null,
							storyNum: frontMatter.userStoryNumber || null,
							nextStory: null, // Not applicable for existing stories
							draftStory: storyAnalysis?.draftStory,
							activeStories: storyAnalysis?.activeStories?.length || 0,
						};
					} catch (error) {
						console.warn(
							`Warning: Could not parse story metadata from ${discoveredStoryPath}: ${error.message}`,
						);
						storyMetadata = {
							epicNum: null,
							storyNum: null,
							nextStory: null,
							draftStory: storyAnalysis?.draftStory,
							activeStories: storyAnalysis?.activeStories?.length || 0,
						};
					}
				} else {
					// For new story creation, use the next story number
					storyMetadata = {
						epicNum: storyAnalysis?.nextStory?.split(".")[0] || null,
						storyNum: storyAnalysis?.nextStory?.split(".")[1] || null,
						nextStory: storyAnalysis?.nextStory,
						draftStory: storyAnalysis?.draftStory,
						activeStories: storyAnalysis?.activeStories?.length || 0,
					};
				}
			}

			const enrichedTaskCall = {
				...taskCall,
				storyMetadata,
			};

			console.log("\n--- Task Tool Call Specification ---");
			console.log(JSON.stringify(enrichedTaskCall, null, 2));
		}
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

// Run the script
main();
