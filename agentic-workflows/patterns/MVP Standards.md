# MVP Principles Development

_Single source of truth for lean development practices_

## Core MVP Philosophy

**MVP-First Approach**: Build functionality that proves the concept works, not bulletproof systems.

- **Direct Path Focus**: Always choose the most direct implementation path to meet explicit requirements
- **Foundation Reuse**: Leverage existing setup work instead of recreating infrastructure
- **Scope Adherence**: Respect PRD's stated scope and non-goals - never exceed them
- **Reality Check**: Validate that each solution serves core functional requirements without unnecessary complexity
- **Simplicity Bias**: When multiple solutions meet requirements, choose the simpler one

### Anti-Patterns to Avoid

❌ **Scope Creep**: Adding features not in PRD requirements  
❌ **Over-Engineering**: Complex solutions when simple ones suffice  
❌ **Framework Recreation**: Building what already exists in the foundation  
❌ **Premature Optimization**: Solving scalability problems that don't exist yet  
❌ **Technical Debt Anxiety**: Avoiding all future refactoring through over-design

## MVP in Task Generation

### Foundation Integration Guidelines

**Before Task Generation**:

1. **Scope-Constrained Research**: Research technologies that align with PRD scope, avoiding solutions that exceed MVP requirements
2. **Foundation Assessment**: Identify existing implementation (database models, CLI setup) and build upon it
3. **Implementation Gap Analysis**: Find missing technical details for explicit requirements only
4. **MVP Reality Check**: Validate each recommendation serves core functional requirements
5. **Direct Path Focus**: Provide most direct implementation path without over-engineering

**Task Structure Requirements**:

- Reference existing files and patterns when possible
- Assume modern Python setup exists (UV, SQLAlchemy 2.0, Typer)
- Include specific, actionable implementation details
- Preserve all explicit PRD requirements - never discard them
- Choose simpler solutions when they meet PRD requirements

## MVP in Testing Standards

### Testing Philosophy

**Core Principles**:

- **MVP-First**: Prove functionality works, not that it's bulletproof
- **Integration-First**: Real database operations over mocking
- **Lean Constraints**: Maximum efficiency with minimum overhead
- **Target Ratio**: 0.3:1 to 0.5:1 test-to-source code (not 1.8:1)

### Test Categories by Priority

#### **HIGH Priority: Integration Tests**

Test complete user workflows with real systems.

**Required for**: CLI commands, database operations, cross-component workflows

```python
def test_task_creation_workflow():
    runner = CliRunner()
    result = runner.invoke(app, ["task", "create", "Test Task"])
    assert result.exit_code == 0

    task_id = extract_id(result.stdout)
    get_result = runner.invoke(app, ["task", "get", task_id])
    assert "Test Task" in get_result.stdout
```

#### **HIGH Priority: Business Logic Tests**

Test domain-specific validation and constraints.

**Required for**: Model validation, business rules, data constraints

#### **MEDIUM Priority: Unit Tests**

Test isolated utility functions only.

**Required for**: Pure functions, utilities without dependencies

#### **FORBIDDEN: Framework Tests**

Never test framework features or implementation details.

### Anti-Mock Rules (Integration Testing)

**Zero Tolerance Policy** - Integration tests MUST use real systems:

- ✅ Real database (`lifeos.db`)
- ✅ Real CLI commands (`uv run lifeos`)
- ✅ Real persistence layer operations
- ✅ Real error conditions and constraints

**Immediate FAILURE if found in integration tests**:

```python
# ❌ FORBIDDEN patterns
@patch('lifeos.cli.main.get_cli_session_context')
mock_persistence = AsyncMock()
mock_task = Mock()
from unittest.mock import MagicMock
```

### Test Budget Constraints

```yaml
# MVP Testing Constraints
testing_budget:
  target_ratio: '0.4:1' # 40 lines of tests per 100 lines of source
  max_tests_per_component: 3 # happy_path + error_handling + persistence
  max_lines_per_test: 8 # Keep tests focused and readable
```

### Per Sub-Task Testing Strategy

Each sub-task should include:

- 1-2 integration tests for actual usage
- 1-2 business logic tests for core behavior
- 1 error handling test if applicable
- **Total**: 3-5 focused tests per sub-task maximum
- **Test file**: One per sub-task (50-100 lines max)
- **File naming**: `test_{domain}_{method}.py`

## MVP in Code Review

### Scope Adherence Validation

**MVP Compliance Checklist**:

- [ ] Implementation addresses explicit PRD requirements only
- [ ] No features added beyond stated scope
- [ ] Foundation patterns reused instead of recreated
- [ ] Direct implementation path chosen over complex alternatives
- [ ] "Basic" and "simple" requirements implemented basically and simply

### Foundation Pattern Compliance

**Required Patterns**:

- Use existing database models and CLI framework
- Follow established file organization conventions
- Reference existing utilities and configurations
- Build upon completed setup work

### Implementation Simplicity

**Simplicity Criteria**:

- Minimal code to meet functional requirements
- Clear, readable implementation
- Appropriate abstractions without over-engineering
- Standard patterns over custom solutions
- Future-ready without premature optimization

## MVP Code Development and Implementation Guidelines

### Development Process Integration

1. **Implementation Planning**: Apply MVP constraints during task generation
2. **Test Writing**: Follow integration-first philosophy with anti-mock rules
3. **Code Implementation**: Focus on direct path to PRD requirements
4. **Quality Validation**: Verify MVP compliance before completion

### Quality Gates by Stage

**Task Generation Stage**:

- Foundation reuse validated
- Scope constraints applied
- Direct path confirmed
- Implementation gaps identified (not upgrades)

**Test Review Stage**:

- Integration-first testing enforced
- Anti-mock rules applied
- Real database usage verified
- Business logic focus validated

**Code Review Stage**:

- MVP scope adherence confirmed
- Foundation patterns used correctly
- Implementation simplicity validated
- No unnecessary complexity added

### Success Criteria

**MVP Implementation Complete When**:

- [ ] All functional requirements from PRD implemented
- [ ] Integration tests exist for core user workflows
- [ ] No mocks in integration tests
- [ ] Test-to-source ratio under 0.5:1
- [ ] All tests focused and concise (under 15 lines each)
- [ ] No features exceed stated scope
- [ ] Foundation patterns reused appropriately
- [ ] Direct implementation path chosen over complex alternatives

## Anti-Patterns to Avoid

### Task Generation Anti-Patterns

❌ **Scope Upgrade**: "The PRD says 'basic CLI' but let's add advanced features"  
❌ **Foundation Ignorance**: "Let's rebuild the database layer from scratch"  
❌ **Research Overreach**: "Let's research enterprise patterns for this simple feature"  
❌ **Complexity Bias**: "This simple solution isn't enterprise-ready enough"

### Testing Anti-Patterns

❌ **Mock Abuse**: Using `@patch`, `Mock`, `AsyncMock` in integration tests  
❌ **Framework Testing**: Testing SQLAlchemy, Typer, Python stdlib functionality  
❌ **Over-Engineering**: 200-line test files for 40-line source modules  
❌ **Implementation Details**: Testing internal class structures or type validation

### Code Review Anti-Patterns

❌ **Feature Creep**: "This would be better with additional capabilities"  
❌ **Architecture Anxiety**: "This won't scale to enterprise levels"  
❌ **Pattern Obsession**: "Let's add more design patterns for flexibility"  
❌ **Premature Abstraction**: "We might need this interface someday"

### Process Anti-Patterns

❌ **Perfectionism**: "This MVP isn't production-ready enough"  
❌ **Technical Debt Fear**: "We must solve all future problems now"  
❌ **Over-Documentation**: "Let's document every possible scenario"  
❌ **Analysis Paralysis**: "We need more research before implementing"

---

_Follow these guidelines to build confidence in functionality while maintaining development velocity._
