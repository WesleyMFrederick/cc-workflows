# Hybrid Domain Model: ProductTank SF

## I. Ubiquitous Language (Glossary)
// The shared vocabulary used by Organizers and System
// Source: gmail.md, learnings-messages-full.md

- **Person**: An individual actor with a persistent identity (The "Who").
- **Scope**: The container for activity. Can be an **Organization**, **Deal**, or **Event**.
- **Affiliation**: The high-level link between a Person and a Scope.
    * *Structured*: Tracks broad categories (Member vs. Leader).
    * *Unstructured*: Specifics (e.g., "Social Media Lead") live in search context.
- **Context Layer**: The "Muscle" of the system. Unstructured notes, messages, and task links that provide nuance to the structured graph.
- **ExternalResource**: A pointer to a tool outside the domain (Linear, Google Drive) that manages execution state.
- **Interaction**: A searchable unit of history (Slack message, Email) used to resolve specific roles via search (e.g., "Who volunteered to MC?").

---

## II. Business Rules & Invariants
// The logical constraints that must remain true

1.  **Identity Persistence**: A `Person` exists independently of any `Affiliation`.
2.  **Polymorphism**: A `Person` can link to *any* Scope (Org, Deal, Event) using the same `Affiliation` mechanism.
3.  **The "Hybrid" Rule**: We do not enforce fine-grained roles (e.g., "AV Sponsor") in the database schema.
    * *Constraint*: If a role is purely operational (tasks), it lives in **Linear**.
    * *Constraint*: If a role is historical/reputational (Resume), it lives in **Affiliation** + **Context**.
4.  **External Source of Truth**: Execution state (Task status) is owned by `ExternalResource` (Linear), not the Domain.

---

## III. Domain Events
// Facts that have happened (Past Tense). Decouples logic from side effects.

| Event Name | Fields | Meaning |
| :--- | :--- | :--- |
| `PersonAffiliated` | `person_id`, `scope_id`, `category` | High-level link established (e.g., "Wesley joined Feb 25 Team"). |
| `ResourceLinked` | `scope_id`, `resource_type`, `url` | External tool connected (e.g., "Linear Project created"). |
| `ContextIndexed` | `content_hash`, `related_entity_ids` | Unstructured data (Slack/Email) added to search index. |

---

## IV. Object Model (Pseudocode)
// High-level architectural definition using "Architecture Patterns with Python" styles
// Abstraction: MEDIUM - Focus on Hybrid Pattern & Integration Points

```ts
// --- SHARED KERNEL ---

// Value Object: Defines the "Target" type
enum ScopeType { ORGANIZATION, DEAL, EVENT }

// Value Object: Broad buckets only. No fine-grained enums.
enum AffiliationCategory { 
  LEADER,       // Core DRI / Owner
  CONTRIBUTOR,  // Volunteer / Speaker
  PARTICIPANT   // Attendee / Observer
}

// Value Object: Pointer to execution tools
class ExternalResource is
  field type: Enum { LINEAR_PROJECT, LINEAR_ISSUE, GDRIVE_FOLDER, MEETUP_URL }
  field url: string
  field label: string

// --- IDENTITY & STRUCTURE (The Skeleton) ---

class Person is
  // <<Aggregate Root>>
  field id: UUID
  field name: string
  private field affiliations: List<Affiliation>

  // Factory: Resolve identity from diverse inputs
  static method resolve(handle: ContactHandle): Person is
    // Integration: Check Identity Service / Vector Index for matches
    // Decision: Merge profiles if high confidence
    ...

class Affiliation is
  // <<Edge>>
  // The persistent link in the graph
  field id: UUID
  field personId: UUID
  field scopeId: UUID
  field category: AffiliationCategory
  
  // Optional: Free text title if needed for display, 
  // but NOT used for logic/filtering.
  field displayTitle: string 

// --- HYBRID CONTEXT (The Muscle) ---

class Scope is
  // <<Entity>> (Abstract Base)
  // Represents Org, Deal, or Event
  field id: UUID
  field type: ScopeType
  
  // The Bridge to Execution
  field resources: List<ExternalResource>

  method linkResource(type: ResourceType, url: string): void is
    // Validation: Check URL format
    this.resources.add(new ExternalResource(type, url))
    emit(new ResourceLinked(this.id, type, url))

class Interaction is
  // <<Searchable Document>>
  // This entity feeds the "BM25 + Embedding" engine.
  // It allows us to ask "Who is the MC?" without a "is_mc" column.
  field id: UUID
  field content: text 
  field vectorEmbedding: float[]
  
  // The Graph Links
  field authorId: UUID
  field scopeId: UUID 

// --- REPOSITORIES (Hybrid) ---

interface ScopeRepository is
  // Structured Access
  method getById(id: UUID): Scope
  
  // Unstructured Access (The "Magic")
  method searchRoles(scopeId: UUID, query: string): List<Person> is
    // 1. Get all People affiliated with Scope
    // 2. Perform Vector Search on their Interactions/Notes
    //    Query: "MC", "Host", "Volunteer"
    // 3. Return ranked list of People
```
