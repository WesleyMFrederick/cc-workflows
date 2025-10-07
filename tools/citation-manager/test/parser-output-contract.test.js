import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMarkdownParser } from '../src/factories/componentFactory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('MarkdownParser Output Contract', () => {
	it('should return complete Parser Output Contract with all fields', async () => {
		// Given: Factory-created parser with test fixture
		const parser = createMarkdownParser();
		const testFile = join(__dirname, 'fixtures', 'valid-citations.md');

		// When: Parsing file
		const result = await parser.parseFile(testFile);

		// Then: All contract fields present with correct types
		expect(result).toHaveProperty('filePath');
		expect(result).toHaveProperty('content');
		expect(result).toHaveProperty('tokens');
		expect(result).toHaveProperty('links');
		expect(result).toHaveProperty('headings');
		expect(result).toHaveProperty('anchors');

		expect(typeof result.filePath).toBe('string');
		expect(typeof result.content).toBe('string');
		expect(Array.isArray(result.tokens)).toBe(true);
		expect(Array.isArray(result.links)).toBe(true);
		expect(Array.isArray(result.headings)).toBe(true);
		expect(Array.isArray(result.anchors)).toBe(true);
	});

	it('should populate headings array with level, text, raw properties', async () => {
		// Given: Parser with fixture containing headings
		const parser = createMarkdownParser();
		const testFile = join(__dirname, 'fixtures', 'valid-citations.md');

		// When: Parse file
		const result = await parser.parseFile(testFile);

		// Then: Headings have required structure
		expect(result.headings.length).toBeGreaterThan(0);

		const heading = result.headings[0];
		expect(heading).toHaveProperty('level');
		expect(heading).toHaveProperty('text');
		expect(heading).toHaveProperty('raw');

		expect(typeof heading.level).toBe('number');
		expect(typeof heading.text).toBe('string');
		expect(typeof heading.raw).toBe('string');
		expect(heading.level).toBeGreaterThanOrEqual(1);
		expect(heading.level).toBeLessThanOrEqual(6);
	});

	it('should populate anchors array with documented AnchorObject schema', async () => {
		// Given: Parser with fixture containing anchors
		const parser = createMarkdownParser();
		const testFile = join(__dirname, 'fixtures', 'valid-citations.md');

		// When: Parse file
		const result = await parser.parseFile(testFile);

		// Then: Anchor objects match Implementation Guide schema
		expect(result.anchors.length).toBeGreaterThan(0);

		const anchor = result.anchors[0];

		// Validate required fields per Implementation Guide
		expect(anchor).toHaveProperty('anchorType');
		expect(anchor).toHaveProperty('id');
		expect(anchor).toHaveProperty('rawText');
		expect(anchor).toHaveProperty('fullMatch');
		expect(anchor).toHaveProperty('line');
		expect(anchor).toHaveProperty('column');

		// Validate enum values
		expect(['header', 'block']).toContain(anchor.anchorType);

		// Validate types
		expect(typeof anchor.id).toBe('string');
		expect(typeof anchor.fullMatch).toBe('string');
		expect(typeof anchor.line).toBe('number');
		expect(typeof anchor.column).toBe('number');

		// rawText can be null for block anchors
		if (anchor.rawText !== null) {
			expect(typeof anchor.rawText).toBe('string');
		}
	});

	it('should populate links array with documented LinkObject schema', async () => {
		// Given: Parser with fixture containing cross-document links
		const parser = createMarkdownParser();
		const testFile = join(__dirname, 'fixtures', 'valid-citations.md');

		// When: Parse file
		const result = await parser.parseFile(testFile);

		// Then: Link objects match Implementation Guide schema
		expect(result.links.length).toBeGreaterThan(0);

		const link = result.links[0];

		// Validate top-level required fields per Implementation Guide
		expect(link).toHaveProperty('linkType');
		expect(link).toHaveProperty('scope');
		expect(link).toHaveProperty('anchorType');
		expect(link).toHaveProperty('source');
		expect(link).toHaveProperty('target');
		expect(link).toHaveProperty('text');
		expect(link).toHaveProperty('fullMatch');
		expect(link).toHaveProperty('line');
		expect(link).toHaveProperty('column');

		// Validate enum values
		expect(['markdown', 'wiki']).toContain(link.linkType);
		expect(['internal', 'cross-document']).toContain(link.scope);
		if (link.anchorType) {
			expect(['header', 'block']).toContain(link.anchorType);
		}

		// Validate source path structure
		expect(link.source).toHaveProperty('path');
		expect(link.source.path).toHaveProperty('absolute');
		expect(typeof link.source.path.absolute).toBe('string');

		// Validate target path structure
		expect(link.target).toHaveProperty('path');
		expect(link.target.path).toHaveProperty('raw');
		expect(link.target.path).toHaveProperty('absolute');
		expect(link.target.path).toHaveProperty('relative');
		expect(link.target).toHaveProperty('anchor');
	});

	it('should correctly populate path variations (raw, absolute, relative)', async () => {
		// Given: Parser with fixture containing cross-document links
		const parser = createMarkdownParser();
		const testFile = join(__dirname, 'fixtures', 'valid-citations.md');

		// When: Parse file with links to other documents
		const result = await parser.parseFile(testFile);

		// Then: Verify raw (original), absolute (full path), relative (from source) all populated
		expect(result.links.length).toBeGreaterThan(0);

		const crossDocLink = result.links.find(link => link.scope === 'cross-document');
		expect(crossDocLink).toBeDefined();

		// Raw path should match the original link target
		expect(typeof crossDocLink.target.path.raw).toBe('string');
		expect(crossDocLink.target.path.raw.length).toBeGreaterThan(0);

		// Absolute path should be full filesystem path (or null if unresolvable)
		if (crossDocLink.target.path.absolute !== null) {
			expect(typeof crossDocLink.target.path.absolute).toBe('string');
		}

		// Relative path should be path relative to source file (or null if unresolvable)
		if (crossDocLink.target.path.relative !== null) {
			expect(typeof crossDocLink.target.path.relative).toBe('string');
		}
	});

	it('should validate enum constraints for linkType, scope, anchorType', async () => {
		// Given: Parser with fixture containing various link types
		const parser = createMarkdownParser();
		const testFile = join(__dirname, 'fixtures', 'valid-citations.md');

		// When: Parse file
		const result = await parser.parseFile(testFile);

		// Then: All links comply with enum constraints
		expect(result.links.length).toBeGreaterThan(0);

		result.links.forEach(link => {
			// linkType must be 'markdown' or 'wiki'
			expect(['markdown', 'wiki']).toContain(link.linkType);

			// scope must be 'internal' or 'cross-document'
			expect(['internal', 'cross-document']).toContain(link.scope);

			// anchorType must be 'header', 'block', or null
			if (link.anchorType !== null) {
				expect(['header', 'block']).toContain(link.anchorType);
			}
		});
	});

	it('should validate headings extracted from complex header fixture', async () => {
		// Given: Parser with complex headers fixture
		const parser = createMarkdownParser();
		const testFile = join(__dirname, 'fixtures', 'complex-headers.md');

		// When: Parse file
		const result = await parser.parseFile(testFile);

		// Then: All headings properly extracted with correct levels
		expect(result.headings.length).toBeGreaterThan(0);

		// Verify at least one heading has expected structure
		const h1Heading = result.headings.find(h => h.level === 1);
		if (h1Heading) {
			expect(h1Heading.level).toBe(1);
			expect(h1Heading.text).toBeTruthy();
			expect(h1Heading.raw).toContain('#');
		}

		// Verify heading levels are valid (1-6)
		result.headings.forEach(heading => {
			expect(heading.level).toBeGreaterThanOrEqual(1);
			expect(heading.level).toBeLessThanOrEqual(6);
		});
	});

	it('should validate parser output matches documented contract schema', async () => {
		// Given: Parser with any valid fixture
		const parser = createMarkdownParser();
		const testFile = join(__dirname, 'fixtures', 'valid-citations.md');

		// When: Parse file
		const result = await parser.parseFile(testFile);

		// Then: Output matches the documented Parser Output Contract
		// Required top-level fields per contract
		const requiredFields = ['filePath', 'content', 'tokens', 'links', 'headings', 'anchors'];
		requiredFields.forEach(field => {
			expect(result).toHaveProperty(field);
		});

		// Verify no unexpected additional fields at top level
		const actualFields = Object.keys(result);
		expect(actualFields.sort()).toEqual(requiredFields.sort());

		// Verify filePath is absolute
		expect(result.filePath).toContain(__dirname);

		// Verify content is non-empty string
		expect(result.content.length).toBeGreaterThan(0);
	});
});
