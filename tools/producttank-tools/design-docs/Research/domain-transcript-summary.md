# Sensemaking Artifact: Product Tank Domain & CRM Architecture

### 1. Executive Gist

**Goal:** Establish a robust data architecture for "Product Tank" to manage events, sponsorships, and relationships, enabling automated workflows (specifically "Thank You" notes) and a lightweight CRM.

**Outcome:** A Domain-Driven Design (DDD) model was finalized that separates "Identity" (Person/Org) from "Role" (Sponsorship/Speaker). The system evolved from a simple spreadsheet concept to a relational schema handling complex scenarios like multi-event deals and ongoing credits.

**Current Status:** Architectural spec is complete. Implementation stack selected: Google Sheets (UI) → Local Node.js Script (Logic/Sync) → Supabase (Postgres Storage) + Gmail API (Outbound).

**Baseline State:** Contact info scattered in Google Sheets; manual processes; ambiguity between "Organization" and "Sponsor."

**Ideal State:** A "Local Orchestra" where a local script syncs sheet data to Supabase, checks logic (CRM history), and triggers automated, personalized emails via Gmail API.

---

### 2. Key Concepts & Glossary

- **Domain-Driven Design (DDD):** Modeling software to match the complex reality of the business domain rather than just storing data.
    
- **Aggregate Root:** The parent entity (e.g., `Person`) that controls access to its children (`ContactPoint`, `ContactPreference`).
    
- **Linking Entity:** An entity (e.g., `Sponsorship`) that exists solely to define the relationship and state between two other entities (e.g., `Organization` and `Event`).
    
- **Polymorphic Association:** A design pattern where a record (like an `Interaction`) can link to multiple different types of entities (Deal, Speaker, Org) dynamically.
    
- **Class Table Inheritance:** A database pattern creating specific sub-tables for different types of a parent entity (discussed but rejected in favor of Sparse Columns).
    
- **Sparse Column:** Adding specific columns (e.g., `venue_id`) to a main table that are left `NULL` for records where they don't apply, preferred here for simplicity.
    
- **The "Champion":** The primary contact at an organization responsible for the high-level sponsorship agreement (lives on the `Deal`).
    
- **The "Logistics" Contact:** The operational contact for specific deliverables (lives on the `Allocation`).
    

---

### 3. Decisions Log

|**ID**|**Decision**|**Rationale**|**Implications**|
|---|---|---|---|
|**D1**|**Separate Identity (Org) from Role (Sponsor)**|An Org exists independently of its sponsorship status. Merging them prevents tracking non-sponsors or past sponsors effectively.|Requires distinct tables for `Organization` and `Sponsorship`.|
|**D2**|**Split Sponsorship into `Deal` & `Allocation`**|One agreement (Deal) might cover multiple events or org-wide credits (Allocations). A single entity couldn't handle "Annual Partner" vs. "March Pizza Sponsor" logic.|`SponsorshipDeal` tracks the pipeline/contract; `SponsorshipAllocation` tracks specific deliverables.|
|**D3**|**Use Reference IDs for Venues**|Storing venue data as text strings causes duplication and update nightmares.|`Venue` is a standalone entity; `Sponsorship` links to `Venue` via FK.|
|**D4**|**Polymorphic CRM Interactions**|Need to log calls/emails about _anything_ (Deals, Speakers, Orgs) without creating 3 separate interaction tables.|`interactions` table uses `subject_id`and `subject_type` to link dynamically.|
|**D5**|**Architecture: Local Script + Cloud DB**|Avoids Vercel timeouts/persistence issues; keeps data secure in Supabase; utilizes free Gmail API quota via local machine execution.|User runs script manually/locally; no need for complex serverless queue infrastructure.|
|**D6**|**Contact Preferences Model**|A person has many contact points; we need logic to know _which_ to use for what context (e.g., "Use LinkedIn for Thank Yous").|`Person` has `ContactPoints` (data) and `ContactPreferences` (rules).|

---

### 4. Action Items

|**ID**|**Task**|**Owner**|**Dependencies**|**Acceptance Criteria**|
|---|---|---|---|---|
|**A1**|**Create Supabase Project**|User|None|Project created, SQL Schema (from Registry) applied successfully.|
|**A2**|**Set up Google Cloud Project**|User|None|Service Account created, `credentials.json` downloaded, Gmail API enabled.|
|**A3**|**Format Google Sheet**|User|A2|Sheet created with "People" and "Sponsorships" tabs; Service Account email added as editor.|
|**A4**|**Develop Ingestion Script**|User|A1, A3|Node.js script reads Sheet, upserts to Supabase (Org -> Person -> Contact), handles dupes.|
|**A5**|**Develop Email Logic**|User|A4|Script queries `Allocations`, checks `Interactions` (prevent duplicates), sends via Gmail, logs result.|
|**A6**|**Generate OAuth2 Token**|User|A2|One-time manual run to get `REFRESH_TOKEN` for Gmail API.|

---

### 5. Domain Entity Registry (Canonical)

**1. Person (Identity)**

- **Purpose:** A human being.
    
- **Fields:** `id` (UUID), `name` (String), `organization_id` (FK -> Organization).
    
- **Children:** `ContactPoint` (Email/Phone data), `ContactPreference` (Rules for usage).
    

**2. Organization (Identity)**

- **Purpose:** A company or group.
    
- **Fields:** `id` (UUID), `name` (String), `website` (String).
    
- **Relationships:** Has many `Person`s (Employees), Owns `Venue`s.
    

**3. Venue (Resource)**

- **Purpose:** A physical space.
    
- **Fields:** `id` (UUID), `name` (String), `address` (String), `capacity` (Int), `owner_org_id` (FK -> Organization).
    

**4. SponsorshipDeal (Commercial - Aggregate Root)**

- **Purpose:** The master agreement/pipeline status.
    
- **Fields:** `id` (UUID), `organization_id` (FK), `deal_owner_id` (FK -> Person [Internal]), `sponsor_contact_id` (FK -> Person [Champion]), `status` (Enum: Prospect, Signed), `start_date`, `end_date`.
    

**5. SponsorshipAllocation (Commercial - Deliverable)**

- **Purpose:** A specific item promised in the deal.
    
- **Fields:** `id` (UUID), `deal_id` (FK), `event_id` (FK, Nullable if global), `type` (Enum: Venue, Cash, Credits), `venue_id`(FK, Nullable, if type=Venue), `logistics_contact_id` (FK, Nullable override).
    

**6. Interaction (CRM)**

- **Purpose:** Record of communication.
    
- **Fields:** `id` (UUID), `organizer_id` (FK), `contact_id` (FK), `type` (Enum: Email, Call, Auto_Email), `summary` (Text), `subject_id` (UUID - Poly), `subject_type` (String - Poly).
    

**7. Event (Activity)**

- **Purpose:** A point-in-time gathering.
    
- **Fields:** `id` (UUID), `date` (DateTime), `venue_id` (FK -> Venue).
    

---

### 6. Constraints & Requirements

- **MUST** support "Pipeline" tracking (potential sponsors not yet booked).
    
- **MUST** distinguish between "Relationship Owner" (Champion) and "Logistics Contact."
    
- **MUST** handle "Global" sponsorships (e.g., Credits) that are not tied to a single event.
    
- **SHOULD** use Google Sheets as the primary user interface for data entry.
    
- **MUST** persist data in a relational database (Supabase), not in Vercel memory.
    
- **MAY** run automation logic locally on a developer machine to simplify Gmail API usage (avoiding server-side auth complexity).
    
- **CONSTRAINT:** Gmail API requires OAuth2 with Refresh Token flow for background sending.
    
- **CONSTRAINT:** Vercel functions are ephemeral; cannot store state between runs.
    

---

### 7. Open Questions & Risks

|**Question**|**Why it Matters**|**Proposed Next Step**|
|---|---|---|
|**Q1: Data Conflicts (Sheet vs DB)**|If a user edits a name in the Sheet _and_the DB, who wins?|Assume Sheet is "Input Only" and DB is "Master Record." Script overwrites DB or logs conflict.|
|**Q2: Deletion Strategy**|If a row is deleted from the Sheet, should it be deleted from Supabase?|**Risk:** Accidental data loss. **Proposal:** Soft delete or ignore (append-only sync).|
|**Q3: Deduplication Logic**|Matching Orgs by "Name" is fragile (e.g., "Google" vs "Google Inc").|Implement simple string normalization (lowercase, trim) in the sync script.|

---

### 8. Diagram (Mermaid)

Code snippet

```
classDiagram
    %% CORE IDENTITIES
    class Organization {
        name
        website
    }
    class Person {
        name
    }
    class Venue {
        name
        address
    }
    class Event {
        date
    }

    %% COMMERCIAL (The Deal)
    class SponsorshipDeal {
        status
        startDate
        endDate
    }
    class SponsorshipAllocation {
        type: Venue|Cash|Credits
        description
        status
    }

    %% CRM (Activity)
    class Interaction {
        type: Email|Call|Auto
        summary
        subjectId
        subjectType
    }

    %% STRUCTURAL RELATIONSHIPS
    Organization "1" o-- "0..*" Person : employs
    Organization "1" --> "0..*" Venue : owns
    
    %% COMMERCIAL RELATIONSHIPS
    Organization "1" --> "0..*" SponsorshipDeal : signatory
    SponsorshipDeal "1" *-- "1..*" SponsorshipAllocation : contains
    SponsorshipDeal "1" --> "1" Person : champion_contact
    
    %% LOGISTICS
    SponsorshipAllocation "0..*" --> "0..1" Event : allocated_to
    SponsorshipAllocation "0..*" --> "0..1" Venue : grants_access_to
    Event "0..*" --> "0..1" Venue : located_at

    %% CRM LINKS (Polymorphic)
    Interaction ..> SponsorshipDeal : tracks
    Interaction ..> Person : involves
```

---

### 9. Coverage Check

- **Missing:** Handling of **Speakers**. The transcript mentioned "SpeakingEngagement" in early diagrams but focused heavily on Sponsorships/Deals in the later implementation steps. The schema for speakers exists in the diagrams but was not detailed in the final script logic.
    
- **Ambiguity:** How specifically to handle **Tasks** (referenced in the CRM design) in the implementation phase. The final script focused only on `Interactions` (logging past events), not `Tasks` (future actions).
    
- **Edge Case:** Managing **Role Changes**. If "Alice" moves from "GitHub" to "Adobe," the current model links her permanently to one Org. DDD suggests `Person` should be independent, with `Employment` as a temporal link, but the current simplified model (`Person.organization_id`) makes moving her difficult without duplicating the record.