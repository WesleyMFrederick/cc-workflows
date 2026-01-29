# Task 14: Slack Exploration Findings

**Date**: 2026-01-27
**Task**: Explore ProductTank SF Slack channels and message patterns
**Status**: In Progress

## Objective

Identify which Slack channels contain event status information and what message patterns exist to inform Linear task updates via the `ptsf-event-status-update` skill.

## Slack MCP Connection

**Status**: ✅ Connected
**Authentication**: User OAuth token (xoxp-*) with 13 scopes
**Configuration**: `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/.mcp.json`

## Channel Discovery

### Public Channels (10 visible)
- `#general` (248 members)
- `#jobs` (73 members) - job postings
- `#networking` (45 members)
- `#events` (42 members)
- `#mentoring` (32 members)
- `#product` (26 members)
- `#volunteers-and-organizers` (19 members)
- `#intros` (16 members)
- `#random` (12 members)
- `#content` (12 members)

### Private Channels (15 visible)
**Organizer Channels:**
- `#volunteers-and-organizers` (19 members)
- `#marketing-volunteers` (9 members)
- `#operating-leads` (6 members) - **KEY: Leadership coordination**
- `#marketing` (6 members)
- `#ptsf-tools-admin` (7 members) - tool updates & requests

**Event-Specific Channels:**
- `#event-producttank-sf-cribl` (9 members)
- `#organizers-26-01-21-olsen-wefunder-tht` (9 members) - Jan event (PASSED)
- `#organizers-26-02-25-vanessa-cribl` (6 members) - Feb event (ACTIVE)
- `#organizers-26-03-xx-x-mixpanel` (5 members) - Mar event (PLANNING)
- `#organizers-25-09-24-jorge-cribl` (8 members)
- `#organizers-25-10-22-aman-vapi-arize` (7 members)

**Project Channels:**
- `#2026-event-machine-project` (6 members) - **KEY: Event process improvement**
- `#future-events` (5 members) - **KEY: Pipeline planning**
- `#workshop-judges` (6 members)

**Sponsor Channels:**
- `#sponsors-25-10-22-aman` (7 members)

## Message Pattern Analysis

### Time Range Examined
- **Primary**: Past 2 days (2026-01-25 to 2026-01-27)
- **Extended**: Past 5 days for key channels (2026-01-22 to 2026-01-27)

### Key Channels & Activity

#### #operating-leads (Past 2 days)
**Activity**: Retro meeting planning
**Messages**:
- Jerry proposing retro format (virtual, weekday afternoon Pacific)
- Budget prioritization discussion (focus on items 2-4, defer item 1 to Q1 check-in)

**Relevance**: Leadership decisions that may affect event timelines

#### #organizers-26-02-25-vanessa-cribl (Past 7 days)
**Activity**: Active - Feb event coordination
**Key Patterns**:
1. **DRI Status Updates**: Jerry posted "DRI/Status as of 1/26/26" message (2026-01-27 03:18:22)
2. **Video/Recording Coordination**:
   - Warren edits video before MTP upload
   - Discussion about Cribl recording vs Warren's edited version
   - A/V coordination with Glenn Block
3. **Date Confusion**: Jerry asked "who are DRI/event managers for Feb and March?" in Feb channel (2026-01-23 17:28:55)
4. **Meetup.com Updates**: Screenshot needs updating for date change
5. **Lenny's Newsletter Conflict**: Feb 25 has competing event, discussion about moving to Feb 17

**Actionable for Linear**:
- DRI status thread maps to multiple Linear tasks
- Video/recording workflow maps to post-event tasks
- A/V coordination maps to venue/logistics tasks

#### #future-events (Past 5 days)
**Activity**: Sponsor pipeline discussions
**Messages**:
- Anima/Matan Odi coordination (Melissa) - workshopping topics, needs NY/SF date alignment
- Cross-promotion with Maciej discussed (Wesley) - promote events to their community
- Sponsor tracking spreadsheet shared (Karsh) - collating various threads

**Actionable for Linear**:
- Sponsor pipeline maps to "Secure Sponsor" Linear tasks
- Speaker coordination maps to "Secure Speaker" Linear tasks

#### #2026-event-machine-project (Past 5 days)
**Activity**: No messages in past 5 days

#### #ptsf-tools-admin (Past 2 days)
**Activity**: No messages in past 2 days

## DRI Confusion Discovery

**Issue**: Jerry asked about Feb/March DRI in the **Feb organizer channel** (#organizers-26-02-25-vanessa-cribl) instead of March channel.

**Root Cause**: No March organizer channel created yet at time of question (2026-01-23). March channel (`#organizers-26-03-xx-x-mixpanel`) exists now but may have been created after Jerry's question.

**Wesley's Response**: Pointed Jerry to retro suggestion in operating-leads but didn't explicitly state "I'm March DRI"

**Implication for Integration**: Need to search across multiple channels to find event ownership discussions, not just event-specific channels.

## Message Pattern Categories

### 1. DRI/Status Updates
**Pattern**: Thread with "DRI/Status as of [date]" subject
**Channel**: Event-specific organizer channels
**Frequency**: Ad-hoc (appears to be manual request from Jerry)
**Maps to**: Multiple Linear tasks across event lifecycle

### 2. A/V Coordination
**Pattern**: Messages about recording, video editing, equipment
**Channel**: Event-specific organizer channels
**Frequency**: Pre-event and post-event phases
**Maps to**: "Coordinate A/V" and post-event video tasks

### 3. Sponsor/Speaker Pipeline
**Pattern**: Discussions about contacts, confirmations, scheduling
**Channel**: #future-events, event-specific channels
**Frequency**: Ongoing throughout planning
**Maps to**: "Secure Sponsor", "Secure Speaker" Linear tasks

### 4. Leadership/Process Decisions
**Pattern**: Retro planning, process improvements, role assignments
**Channel**: #operating-leads, #2026-event-machine-project
**Frequency**: Quarterly or as-needed
**Maps to**: Meta-tasks, not event-specific

### 5. Logistics Coordination
**Pattern**: Venue details, date conflicts, Meetup.com updates
**Channel**: Event-specific organizer channels
**Frequency**: Pre-event phase
**Maps to**: "Book Venue", "Create Meetup.com Event" Linear tasks

## Key Insights

1. **Event channels follow naming pattern**: `#organizers-YY-MM-DD-speaker-sponsor`
2. **DRI status updates are threaded**, not standalone messages
3. **Cross-channel coordination required**: Future events discussed in #future-events, execution in event-specific channels
4. **Manual process debt acknowledged**: Jerry's message "Sorry to push a sub-optimal process" indicates awareness of workflow gaps
5. **Retro needed**: Multiple references to needing retrospective to improve process

## Slack → Linear Mapping Opportunities

### High Value
1. **DRI Status Thread → Linear Task Status Updates**
   - Parse DRI status thread in event channel
   - Extract task mentions and status indicators
   - Update corresponding Linear tasks

2. **Sponsor/Speaker Confirmations → Linear Completions**
   - Monitor #future-events for confirmation messages
   - Mark "Secure Sponsor/Speaker" tasks as complete when confirmed

### Medium Value
1. **A/V Coordination → Logistics Task Updates**
   - Track A/V discussions in event channels
   - Update pre-event A/V tasks

2. **Post-Event Video → Post-Event Task Tracking**
   - Monitor video editing discussions
   - Update "Upload to YouTube" and related tasks

### Low Value (Manual Override)
1. **Leadership Decisions → Manual Review**
   - Operating leads and process changes require human judgment
   - Flag for manual review, don't auto-update

## Open Questions

1. **DRI Status Format**: Is there a standard structure to DRI status threads, or is it freeform?
2. **Channel Creation Timing**: When are event-specific organizer channels created? (Appears to be after speaker/venue confirmed)
3. **Slack as Source of Truth**: What information lives ONLY in Slack vs also in Linear/Gmail?
4. **Search Scope**: Should integration search all channels or only specific patterns?

## Next Steps (Task 15)

1. Read DRI status thread in #organizers-26-02-25 to understand format
2. Define mapping rules: Slack message patterns → Linear task updates
3. Identify which channels to monitor for each event lifecycle phase
4. Determine search strategy (history vs search API)
5. Design skill enhancement for `ptsf-event-status-update`

## References

- Slack MCP Server: <https://github.com/rusq/slack-mcp-server>
- Plan: `/Users/wesleyfrederick/.claude/plans/precious-questing-pond.md`
- Task List: See TaskList tool
