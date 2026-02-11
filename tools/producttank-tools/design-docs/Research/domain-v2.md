Here is the refined Domain Map Definition, aligned with Architecture Patterns with Python guidelines.
This version explicitly defines Aggregate Boundaries to ensure data consistency, uses ID References to prevent object graph coupling, and introduces Domain Events to handle side effects (like updating CRM history or triggering notifications).
# Domain Map Definition: ProductTank SF

## I. Ubiquitous Language (Glossary)
// The shared vocabulary used by Organizers and System
// Source: gmail.md, learnings-messages-full.md

- **Person**: An individual actor with a persistent identity. The consistent "Who" across all contexts.
- **Organization**: A legal entity or community acting as a container for resources and reputation.
- **Affiliation**: The link between a *Person* and a *Scope*. It answers "In what capacity is this person acting?" (e.g., "Representing Mixpanel" vs. "Solo Speaker").
- **Scope**: The target of an affiliation. Can be an **Organization** (Employment), a **Deal** (Negotiation), or an **Event** (Volunteering).
- **Role**: A set of capabilities or "hats" worn within an Affiliation (e.g., *Organizer*, *Sponsor Rep*, *Speaker*).
- **Deal**: A distinct unit of value exchange. Can be Commercial (Sponsorship) or Content (Speaking Engagement). Independent of an Event until scheduled.
- **Thread**: A discrete communication history (Email chain, Slack thread) that tracks interactions.

---

## II. Business Rules & Invariants
// The logical constraints that must remain true (Consistency Boundaries)

1.  **Identity Persistence**: A `Person` exists independently of any `Organization` or `Deal`. Deleting an Org does not delete the People.
2.  **Polymorphic Affiliation**: A Person must be able to affiliate with *any* Scope Type (Org, Deal, Event) using the same mechanism.
3.  **Reference by Identity**: Aggregates (Person, Org, Deal) reference each other **only by ID**, never by object embedding. This keeps transaction boundaries small.
4.  **Role Stacking**: An Affiliation is a container for multiple `Roles`. A person can be an *Organizer* and *Attendee* simultaneously within the same Affiliation context.

---

## III. Domain Events
// Facts that have happened (Past Tense). These decouple logic from side effects.

| Event Name | Fields | Meaning |
| :--- | :--- | :--- |
| `PersonAffiliated` | `person_id`, `scope_id`, `scope_type` | A person has been linked to a context (e.g., Hired by Cribl, Added to Deal). |
| `RoleGranted` | `affiliation_id`, `role_name` | A specific capability was added (e.g., "Became an Organizer"). |
| `DealStatusChanged` | `deal_id`, `old_status`, `new_status` | A deal moved pipeline stages (e.g., Prospect -> Signed). |
| `InteractionLogged` | `thread_id`, `author_person_id`, `channel` | A message was captured and resolved to a Person. |

---

## IV. Object Model (Pseudocode)
// High-level architectural definition using "Architecture Patterns with Python" styles

```ts
// --- SHARED KERNEL ---

// Value Object: Defines the "Target" type for an affiliation
enum ScopeType { ORGANIZATION, DEAL, EVENT }

// --- IDENTITY CONTEXT ---

class Person is
  // <<Aggregate Root>>
  // Consistency Boundary: Manages Handles and Affiliations
  field id: UUID
  field name: string
  private field contactMethods: List<ContactMethod>
  private field affiliations: List<Affiliation>

  method addAffiliation(scopeId: UUID, type: ScopeType): void is
    // Invariant: Prevent duplicate active affiliations to same scope
    if (this.hasActiveAffiliation(scopeId)) throw Error
    
    // Create internal entity
    field affiliation = new Affiliation(scopeId, type)
    this.affiliations.add(affiliation)
    
    // Event: Notify system (e.g., to index search)
    emit(new PersonAffiliated(this.id, scopeId, type))

class Affiliation is
  // <<Local Entity>> inside Person Aggregate
  // Holds the specific Roles for this Context
  field id: UUID
  field scopeId: UUID // Reference by ID (Decoupled)
  field scopeType: ScopeType
  private field roles: List<Role>

class Role is
  // <<Value Object>>
  // Immutable descriptor of capability
  field name: Enum { ORGANIZER, SPONSOR_REP, SPEAKER, VOLUNTEER, ATTENDEE }
  field status: Enum { ACTIVE, FORMER }

// --- COMMERCIAL CONTEXT ---

class Deal is
  // <<Aggregate Root>>
  // Consistency Boundary: Manages Lifecycle and Allocations
  field id: UUID
  field title: string // e.g., "Mixpanel FY26 Sponsorship"
  field status: DealStatus
  
  // Who is the counter-party?
  // Could be an Org (Sponsorship) or Person (Solo Speaker)
  field counterPartyId: UUID 
  
  method updateStatus(newStatus: DealStatus): void is
    // Invariant: Cannot move backward from CLOSED to PIPELINE
    // Business Rule Logic...
    this.status = newStatus
    emit(new DealStatusChanged(this.id, this.status, newStatus))

class Organization is
  // <<Aggregate Root>>
  field id: UUID
  field name: string
  field domain: string

// --- ACTIVITY CONTEXT ---

class Event is
  // <<Aggregate Root>>
  field id: UUID
  field date: DateTime
  field venueReference: VenueID // Reference to a physical resource

// --- COMMUNICATION CONTEXT ---

class Thread is
  // <<Aggregate Root>>
  // Consistency Boundary: Messages must belong to a Thread
  field id: UUID
  field contextScopeId: UUID // Links thread to Deal or Event
  private field messages: List<Message>

  method postMessage(authorId: UUID, content: string): void is
    // Invariant: Thread must be open
    this.messages.add(new Message(authorId, content))
    emit(new InteractionLogged(this.id, authorId))
```


## V. Concrete Scenarios (Validation)
### Scenario A: The Solo Speaker (Vanessa)
Context: Vanessa interacts regarding a talk, but no event is scheduled yet.
 * Command: CreatePotentialDeal(Title="Strategic Focus Talk", Type=SPEAKING)
 * Aggregate (Deal): Created with ID Deal-123. Status: PIPELINE.
 * Command: AffiliatePerson(Person="Vanessa", Scope=Deal-123)
 * Aggregate (Person): Adds Affiliation linked to Deal-123.
 * Event: PersonAffiliated fired.
 * Result: Vanessa is now tracked as a "Potential Speaker" independent of any Event or Organization.
### Scenario B: The Corporate Sponsor (Glenn)
Context: Glenn approves budget for Cribl.
 * Existing State: Person(Glenn) and Organization(Cribl) exist.
 * Command: AffiliatePerson(Person="Glenn", Scope=Cribl)
 * Aggregate (Person): Adds Affiliation linked to Cribl. Adds Role(SPONSOR_REP).
 * Event: RoleGranted fired.
 * Result: Glenn is linked to Cribl. When the "Cribl Sponsorship Deal" is created, Glenn is referenced as the Champion by ID.
### Scenario C: The One-Off Volunteer (Wesley)
Context: Wesley volunteers to MC the Feb 25 event.
 * Existing State: Person(Wesley) exists. Event(Feb25) exists.
 * Command: AffiliatePerson(Person="Wesley", Scope=Event-Feb25)
 * Aggregate (Person): Adds Affiliation linked to Event-Feb25. Adds Role(VOLUNTEER).
 * Result: Wesley has a permanent record on his "Resume" (Person Aggregate) that he volunteered for this specific event ID, without cluttering the global Organization roster.
<!-- end list -->

