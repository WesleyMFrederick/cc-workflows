---
name: writing-spec-documents
description: Use when creating implementation specification documents - ALWAYS required in Phase 2 regardless of bridge weight, prescribes exactly what to build with traceability to whiteboard decisions
---

# Writing Spec Documents

Create implementation specification documents that prescribe exactly what to build. The spec is a living document that evolves during sequencing and implementation.

**Announce at start:** "I'm using the writing-spec-documents skill to create the implementation spec."

## When to Use

**ALWAYS use this skill in Phase 2.** Spec documents are required regardless of bridge weight.

| Bridge Weight | Design Doc | Spec Doc | This Skill |
|---------------|------------|----------|------------|
| Heavy | Required | Required | **Required** |
| Medium | Optional | Required | **Required** |
| Light | Skip | Required | **Required** |
| Thin | Skip | Required | **Required** |

**Key difference from design doc:**
- Design doc = WHY (rationale, exploration, stable)
- Spec doc = HOW (prescription, living, evolves)

## Inputs

| Bridge Weight | Required Inputs |
|---------------|-----------------|
| Heavy/Medium | PRD, Whiteboard, Design Doc |
| Light/Thin | PRD, Whiteboard |

Before starting, ensure you have:

1. **PRD with FRs** — requirements document with block-anchored FRs
2. **Phase 2 Whiteboard** — decisions with `^decision-N` anchors
3. **Design Doc** (Heavy/Medium only) — formal design rationale

## Traceability Model

Spec references whiteboard decisions. When spec changes, add new decision to whiteboard FIRST.

```text
Whiteboard (append-only)        Spec (living)
├── ^decision-D1 ──────────►   <satisfies>D1</satisfies>
├── ^decision-D2 ──────────►   <component references="D2">
└── ^decision-D3 ──────────►   <changes references="D3">
```

**Rule:** Every significant spec element should trace to a whiteboard decision or PRD FR/NFR.

## Spec Document Structure

Save to: `{{feature-dir}}/{{feature-name}}-spec.md`

The spec uses XML format in a codeblock for structured, machine-parseable content.

```markdown
# {{Feature Name}} — Specification

**Feature**: {{feature name}}
**Phase**: 2 (Design)
**Status**: Draft

> **Context:**
> - [PRD]({{feature-name}}-prd.md)
> - [Phase 2 Whiteboard](2-design-phase/phase2-design-whiteboard.md)
> - [Design Doc]({{feature-name}}-design.md) _(if Heavy/Medium bridge)_

---

\`\`\`xml
<project_specification>
  <project_name>{{Feature Name}}</project_name>

  <overview>
    {{Brief description of what's being built}}
  </overview>

  <!-- Heavy Bridge: Include all optional sections -->
  <!-- Medium/Light/Thin: Include only what's needed -->

  <!-- OPTIONAL: Heavy Bridge only -->
  <technology_stack>{{See Extended Templates}}</technology_stack>
  <prerequisites>{{See Extended Templates}}</prerequisites>
  <core_features>{{See Extended Templates}}</core_features>

  <!-- CORE: All bridge weights -->
  <components>
    {{See Component Template below}}
  </components>

  <data_schemas>
    {{See Data Schema Template below}}
    {{Or use Extended database_schema for Heavy Bridge}}
  </data_schemas>

  <integration>
    {{See Integration Template below}}
  </integration>

  <!-- OPTIONAL: Heavy Bridge with UI -->
  <api_endpoints>{{See Extended Templates}}</api_endpoints>
  <ui_layout>{{See Extended Templates}}</ui_layout>
  <design_system>{{See Extended Templates}}</design_system>
  <key_interactions>{{See Extended Templates}}</key_interactions>

  <!-- CORE: All bridge weights -->
  <acceptance_criteria>
    {{See AC Template below}}
    {{Or use Extended success_criteria for Heavy Bridge}}
  </acceptance_criteria>

  <risks>
    {{See Risk Template below}}
  </risks>
</project_specification>
\`\`\`
```

## Component Template

```xml
<component name="{{component-name}}" port_type="{{type}}">
  <source>{{source file path if porting}}</source>
  <target>{{target file path}}</target>
  <lines>{{estimated lines}}</lines>
  <language>{{language}}</language>
  <changes>
    - {{Change 1}}
    - {{Change 2}}
  </changes>
  <satisfies>{{FR1, FR2, D1}}</satisfies>
</component>
```

**Port types:**
- `new` — New file, not in source
- `copy_modify` — Copy from source with path/config changes only
- `rewrite` — Significant structural rewrite (language change, tool change)
- `translation` — Language translation, same logic

## Data Schema Template

```xml
<schema name="{{schema-name}}">
  <format>{{JSON, YAML, JSONL, etc.}}</format>
  <location>{{file path}}</location>
  <fields>
    - {{field1}}: {{type and description}}
    - {{field2}}: {{type and description}}
  </fields>
</schema>
```

## Integration Template

```xml
<integration>
  <hook_registration>
    <file>{{config file path}}</file>
    <additions>
      {{What's being added to the config}}
    </additions>
  </hook_registration>

  <directory_structure>
    <path>{{base path}}</path>
    <contents>
      - {{file/dir 1}} — {{purpose}}
      - {{file/dir 2}} — {{purpose}}
    </contents>
  </directory_structure>

  <path_mapping>
    <entry>
      <source>{{source path}}</source>
      <target>{{target path}}</target>
    </entry>
  </path_mapping>
</integration>
```

## Acceptance Criteria Template

```xml
<acceptance_criteria>
  <section name="{{Section Name}}" fr="{{FR1}}">
    - AC1: {{Testable acceptance criterion}}
    - AC2: {{Testable acceptance criterion}}
  </section>
</acceptance_criteria>
```

**Traceability:** Each AC section traces to an FR. Individual ACs inherit that traceability.

## Risk Template

```xml
<risks>
  <risk severity="{{High|Medium|Low}}">
    <description>{{What could go wrong}}</description>
    <mitigation>{{How to prevent or handle it}}</mitigation>
  </risk>
</risks>
```

---

## Heavy Bridge Extended Templates

**When to use:** Greenfield apps, major integrations, full-stack features. These sections provide complete prescription for implementation.

### Technology Stack Template

Include when building new applications or adding major subsystems.

```xml
<technology_stack>
  <frontend>
    <framework>{{React, Vue, Svelte, etc.}}</framework>
    <styling>{{Tailwind, CSS Modules, styled-components}}</styling>
    <state_management>{{Context, Redux, Zustand, etc.}}</state_management>
    <routing>{{React Router, Vue Router, etc.}}</routing>
    <port>{{Port number if applicable}}</port>
  </frontend>

  <backend>
    <runtime>{{Node.js, Python, Go, etc.}}</runtime>
    <framework>{{Express, FastAPI, Gin, etc.}}</framework>
    <database>{{PostgreSQL, SQLite, MongoDB, etc.}}</database>
    <orm>{{Prisma, Drizzle, SQLAlchemy, etc.}}</orm>
  </backend>

  <communication>
    <api>{{REST, GraphQL, gRPC}}</api>
    <realtime>{{WebSocket, SSE, polling}}</realtime>
    <external>{{Third-party API integrations}}</external>
  </communication>
</technology_stack>
```

### Prerequisites Template

Include when environment setup is non-trivial.

```xml
<prerequisites>
  <environment_setup>
    - {{Required env vars with purpose}}
    - {{Pre-installed dependencies}}
    - {{Directory structure requirements}}
    - {{External service dependencies}}
  </environment_setup>

  <assumptions>
    - {{What's assumed to already exist}}
    - {{What doesn't need to be built}}
  </assumptions>
</prerequisites>
```

### Core Features Template

Include for feature-rich applications. Group by domain.

```xml
<core_features>
  <feature_group name="{{Domain Name}}">
    - {{Feature 1 with brief description}}
    - {{Feature 2 with brief description}}
    - {{Feature 3 with brief description}}
  </feature_group>

  <feature_group name="{{Another Domain}}">
    - {{Feature 1}}
    - {{Feature 2}}
  </feature_group>
</core_features>
```

**Guidance:** Each feature should be testable. Avoid vague descriptions like "good UX" — be specific.

### Database Schema Template (Extended)

For full-stack apps, use detailed table definitions instead of minimal schema.

```xml
<database_schema>
  <tables>
    <table name="{{table_name}}">
      - id: {{type, constraints}}
      - {{field_name}}: {{type, constraints, description}}
      - {{field_name}}: {{type, constraints, FK reference}}
      - created_at, updated_at: {{timestamp fields}}
    </table>

    <table name="{{another_table}}">
      - id: {{type}}
      - {{foreign_key}}_id: FK to {{referenced_table}}
      - {{fields...}}
    </table>
  </tables>

  <indexes>
    - {{table.field}} — {{purpose}}
  </indexes>

  <constraints>
    - {{Unique constraints, check constraints}}
  </constraints>
</database_schema>
```

### API Endpoints Template

Include for backend services. Group by resource domain.

```xml
<api_endpoints>
  <resource name="{{Resource Name}}">
    - GET    /api/{{resource}}           — List all
    - POST   /api/{{resource}}           — Create new
    - GET    /api/{{resource}}/:id       — Get by ID
    - PUT    /api/{{resource}}/:id       — Update
    - DELETE /api/{{resource}}/:id       — Delete
    - POST   /api/{{resource}}/:id/{{action}} — Custom action
  </resource>

  <resource name="{{Another Resource}}">
    - {{endpoints...}}
  </resource>

  <special>
    - GET  /api/health     — Health check
    - POST /api/{{stream}} — SSE/WebSocket endpoint
  </special>
</api_endpoints>
```

### UI Layout Template

Include for frontend-heavy applications.

```xml
<ui_layout>
  <main_structure>
    - {{Layout description: columns, panels, responsive behavior}}
    - {{Navigation structure}}
    - {{Persistent elements}}
  </main_structure>

  <section name="{{Section Name}}">
    - {{Component 1}} — {{purpose}}
    - {{Component 2}} — {{purpose}}
    - {{Interactive elements}}
  </section>

  <modals_overlays>
    - {{Modal 1}} — {{trigger and purpose}}
    - {{Modal 2}} — {{trigger and purpose}}
  </modals_overlays>

  <responsive_breakpoints>
    - mobile: {{behavior}}
    - tablet: {{behavior}}
    - desktop: {{behavior}}
  </responsive_breakpoints>
</ui_layout>
```

### Design System Template

Include when visual consistency matters (user-facing apps).

```xml
<design_system>
  <color_palette>
    - Primary: {{color and hex}}
    - Background: {{light mode / dark mode}}
    - Text: {{primary / secondary}}
    - Accent: {{for CTAs, highlights}}
    - Error/Warning/Success: {{semantic colors}}
  </color_palette>

  <typography>
    - Font family: {{system stack or custom fonts}}
    - Headings: {{weight, sizes}}
    - Body: {{size, line-height}}
    - Code: {{monospace font}}
  </typography>

  <components>
    <component name="{{Button}}">
      - Primary: {{style description}}
      - Secondary: {{style description}}
      - States: hover, disabled, loading
    </component>
    {{Additional component patterns...}}
  </components>

  <animations>
    - Transitions: {{duration, easing}}
    - Loading states: {{spinner, skeleton, etc.}}
    - Micro-interactions: {{hover, focus, click}}
  </animations>
</design_system>
```

### Key Interactions Template

Include for complex user flows. Document sequences.

```xml
<key_interactions>
  <flow name="{{Flow Name}}">
    <steps>
      1. {{User action}}
      2. {{System response}}
      3. {{User action}}
      4. {{System response with state change}}
      5. {{Completion/confirmation}}
    </steps>
    <edge_cases>
      - {{Error condition}} → {{handling}}
      - {{Timeout}} → {{handling}}
    </edge_cases>
  </flow>

  <flow name="{{Another Flow}}">
    {{steps...}}
  </flow>
</key_interactions>
```

### Success Criteria Template (Extended)

For Heavy bridge, expand beyond basic ACs.

```xml
<success_criteria>
  <category name="Functionality">
    - {{Core feature works as specified}}
    - {{CRUD operations complete}}
    - {{Edge cases handled}}
  </category>

  <category name="User Experience">
    - {{Responsive on target devices}}
    - {{Loading states visible}}
    - {{Error messages clear}}
    - {{Performance targets met}}
  </category>

  <category name="Technical Quality">
    - {{Test coverage threshold}}
    - {{No lint errors}}
    - {{Type safety maintained}}
    - {{Error handling complete}}
  </category>

  <category name="Design Polish" fr="{{NFR}}">
    - {{Matches design system}}
    - {{Animations smooth}}
    - {{Accessibility requirements met}}
  </category>
</success_criteria>
```

---

## Bridge-Specific Content

### Heavy Bridge (Greenfield, Integration, API)

Full spec with all sections. **Use Extended Templates above.**

**Required sections:**
- `<technology_stack>` — Full stack definition
- `<prerequisites>` — Environment and assumptions
- `<core_features>` — Grouped feature list
- `<components>` — With behavior descriptions
- `<database_schema>` — Full tables with fields
- `<api_endpoints>` — Grouped by resource
- `<integration>` — All integration points

**For user-facing apps, also include:**
- `<ui_layout>` — Structure and responsive behavior
- `<design_system>` — Colors, typography, components
- `<key_interactions>` — User flow sequences

**Always include:**
- `<success_criteria>` — Extended with categories
- `<risks>` — With mitigations

### Medium Bridge (Brownfield, Migration)

Moderate spec:
- Component specs focused on changes
- Schemas for new/modified data
- Integration changes only
- ACs for new functionality

### Light Bridge (Port, Refactor)

Focused spec:
- Components with port_type and source/target mapping
- Path mappings (source → target)
- Minimal schemas (only if format changes)
- ACs focused on parity validation

### Thin Bridge (Bug Fix, Deprecation)

Minimal spec:
- Affected components only
- Change description
- Verification criteria

## Spec Evolution

The spec is a **living document**. It changes during:

1. **Sequencing (Phase 3)** — ACs refined, risks reassessed
2. **Implementation (Phase 4)** — Details adjusted based on reality

**When changing the spec:**

1. Add new decision to whiteboard with rationale: `^decision-DN`
2. Update spec component/section with reference: `<satisfies>DN</satisfies>`
3. Commit both files together

**Never:** Change spec without whiteboard decision anchor.

## Output Location

| Artifact | Location |
|----------|----------|
| Spec Document | `{{feature-dir}}/{{feature-name}}-spec.md` |

## Validation Checklist

After writing spec, verify:

1. [ ] Every component has `<satisfies>` tracing to FR or decision
2. [ ] All port_types are correct (new, copy_modify, rewrite, translation)
3. [ ] Path mappings are complete (source → target)
4. [ ] ACs trace to FRs
5. [ ] Risks have mitigations
6. [ ] Run `citation-manager validate <spec-path>`

## Common Mistakes

| Mistake | Why It's Wrong | Fix |
|---------|----------------|-----|
| Spec without decision traceability | Can't understand why changes were made | Add `<satisfies>` to every component |
| Changing spec without whiteboard update | Breaks traceability, loses rationale | Add decision to whiteboard first |
| Over-specifying for Light bridge | Wastes effort on unnecessary detail | Match spec depth to bridge weight |
| Under-specifying for Heavy bridge | Insufficient guidance for implementation | Include all sections for Heavy bridge |
| Hardcoded paths in spec | Breaks portability | Use variables like `$PROJECT` |

## Red Flags

- Components without `<satisfies>` traceability
- Spec changes with no corresponding whiteboard decision
- Heavy bridge with minimal spec content
- Light bridge with excessive spec content
- Missing path mappings for ports
- ACs that don't trace to FRs

## Integration with Other Skills

**Inputs from:**
- `writing-requirements-documents` — PRD with FRs
- `writing-design-documents` — Design doc (Heavy/Medium bridge)
- Phase 2 whiteboard — Decision anchors

**Outputs to:**
- Sequencing phase — Spec informs work decomposition
- `writing-plans` — Spec feeds implementation planning

**Referenced by:**
- `enforcing-development-workflow` — Phase 2 REQUIRED skill (all bridge weights)

---

**Remember:** The spec prescribes exactly what to build. It's a living document that evolves, but every change must trace back to a whiteboard decision. Spec depth should match bridge weight — don't over-engineer for ports, don't under-specify for greenfield.
