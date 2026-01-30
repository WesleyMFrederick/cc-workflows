## Valid Caret Citations

- This references ^FR1 correctly
- Check the requirements at ^US1-1AC1
- See design ^NFR2

## Version Strings (Should NOT Match)

| Technology | Version |
|------------|---------|
| Commander.js | ^14.0.1 |
| marked | ^15.0.12 |
| typescript | ^5.3.0 |

## Edge Cases

- Git commit: ^abc123 (should match - valid block ref)
- Semantic version: ^v1.2.3 (should NOT match)
- npm range: >=1.0.0 <2.0.0 (should NOT match)
- Obsidian anchor at end ^test-anchor

