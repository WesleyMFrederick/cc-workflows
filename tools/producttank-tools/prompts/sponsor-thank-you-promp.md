## Task: Create Venue Sponsor Thank You Email Drafts

### Gmail Account
Create all drafts in: <wmfrederick+producttanksf@gmail.com>

### Data Source
Read the ProductTank SF Events Tracker spreadsheet:
<https://docs.google.com/spreadsheets/d/1RnNx_kF0YsaiG2VlcgMO1oVs56rjKBIxtQKjVsvwq2o/edit>

From the "Next Events" sheet, extract 2025 venue data:
- Venue Company (Column Q)
- Venue Event Contact First Name (Column AC)
- Venue Event Contact Email (Column AD)
- Venue Space Contact First Name (Column AE)
- Venue Space Contact Email (Column AF)
- Event month (from Column A date)
- YouTube Video Title (Column H)
- YouTube URL (Column I) - only if actual URL exists

### Grouping Logic
1. Filter to 2025 events only
2. Group all events by Venue Company
3. For each venue, collect ALL event months and YouTube URLs
4. Deduplicate contacts: if Event Contact and Space Contact are the same person/email, send one email to that person
5. If Event Contact and Space Contact are different people, CC the Space Contact
6. Create ONE email draft per venue (not per event)

### Email Structure

**To:** {{venue_event_contact_email}}
**CC:** {{venue_space_contact_email}} (only if different person from To)
**Subject:** ProductTank SF Thanks You for an Amazing 2025 at {{venue}}

**Opening (choose based on event count):**

%% if 3+ events then %%
Hi {{first_name(s)}},

What a year! {{venue}} helped us out big time. You hosted {{count}} ProductTank SF events in 2025, giving our community a place to connect, learn, and grow together.

%% if 2 events then %%
Hi {{first_name(s)}},

Thank you for hosting ProductTank SF at {{venue}} this year. Our {{month_list}} events gave our community a place to connect, learn, and grow together.

%% if 1 events then %%
Hi {{first_name(s)}},

Thank you for hosting ProductTank SF at {{venue}} for our {{month}} event. The evening gave our community a place to connect, learn, and grow together.
%% end if %%

I wanted to share the recording(s) from {{those evenings / that evening}} in case {{they are / it is}} useful for your own channels:
- {{month}}: [{{video_title}}]({{youtube_url}})
- {{month}}: [{{video_title}}]({{youtube_url}})
- {{if video pending for a month}}: {{month}}: We are still finalizing this one and will send the link once it is ready.

We couldn't couldn't have pulled off {{event-year}} without you. We would love to continue working together in {{next-event-year}}.

Thank you again from me and on behalf of Karsh, Melissa, Jerry, Betty, and Glenn.

Best,
Wesley

### Instructions
1. Filter to 2025 events only
2. Skip venues without any contact email in columns AC-AF
3. Group events by venue before generating emails
4. If a venue has NO YouTube URLs at all, omit the video section entirely
5. If some events have URLs and some do not, list available URLs and note pending ones
6. Adjust grammar for singular/plural (evening/evenings, recording/recordings, it is/they are)
7. If CC-ing a second contact, address both names in greeting (e.g., "Hi Teddy and Marco,")
8. ~~Create one Gmail draft per venue (do not send)~~ Output email in chat
9. Report which drafts were created and any venues skipped (with reason)

---

~~~markdown
## Task: Create Sponsor Thank You Emails + Track in Linear

### Overview
This is an **iterative workflow**:
1. **First run**: Generate email drafts for sponsors not yet sent
2. **Subsequent runs**: Detect sent emails in Gmail, update Linear tracking, then generate remaining drafts

### Gmail Account
- **From:** wmfrederick+producttanksf@gmail.com
- **To:** All sponsor contacts (primary + additional)
- **CC:** Jerry Young <jerryjyoung@gmail.com>, karsh.pandey@gmail.com, emargulies@gmail.com, melissahsu2016@gmail.com

### Linear Task
- **Issue:** PRO-194 (2025 EoY: Send Venue, F&B, In-Kind Thank You notes)
- **Update description table** with current status per sponsor
- **Add comment** for each sent email (copy of email content)

---

## Workflow Steps

### Step 1: Check Current State

1. **Read Linear PRO-194** - get current status table
2. **Search Gmail** for sent emails matching pattern:
   - `from:me subject:"ProductTank SF Thanks" to:{{sponsor_email}}`
   - Check each sponsor contact
3. **Read spreadsheet** for any new sponsor data

### Step 2: Update Linear with Sent Emails

For each email found in Gmail that's not yet tracked in Linear:
1. **Add comment** to PRO-194 with email content:
```
   ## ✅ {{Sponsor}} - Sent {{date}}
   
   **To:** {{recipients}}
   **Subject:** {{subject}}
   
   ---
   
   {{email body}}
```
2. **Update description table** - change status to "✅ Sent"

### Step 3: Generate Remaining Drafts

For sponsors with status "⬜ Not sent" and valid contacts:
1. Output email draft in chat
2. Wait for user to send
3. On next run, detect and update Linear

---

## Data Source

**Spreadsheet:** [ProductTank SF Events Tracker](https://docs.google.com/spreadsheets/d/1RnNx_kF0YsaiG2VlcgMO1oVs56rjKBIxtQKjVsvwq2o/edit)

**Columns (Next Events sheet):**
| Data | Column |
|------|--------|
| Date, Year | A, B |
| YouTube Title, URL | H, I |
| Venue Company | Q |
| Venue Event Contact | AC (name), AD (email) |
| Venue Space Contact | AE (name), AF (email) |
| F&B Sponsor Company | AG |
| F&B Sponsor Contact | AH (name), AI (email) |
| F&B Sponsor Notes | AJ |

---

## Sponsor Classification

| Type | Logic |
|------|-------|
| **Venue-only** | In Column Q, not in AG, Column T ≠ venue |
| **F&B-only** | In Column AG (or T), not in Q |
| **Venue + F&B** | Same company in Q AND (AG or T) |
| **Mixed** | Different sponsorship types across events |

---

## Email Draft Output Format

**CRITICAL formatting rules:**
1. To, CC, Subject each on its own line with blank line between
2. **No em dashes (—)** - use commas, periods, or "and" instead

```
## Draft: {{Sponsor}} ({{Type}})

**To:** {{emails}}

**CC:** jerryjyoung@gmail.com, karsh.pandey@gmail.com, emargulies@gmail.com, melissahsu2016@gmail.com

**Subject:** {{subject}}

---

{{email body}}
```

---

## Email Template

**Subject:** ProductTank SF Thanks You for an Amazing 2025{{" at " + company if venue}}

### Opening (by event count)

**3+ events:**
> Hi {{names}},
> 
> What a year! {{company}} helped us out big time in 2025. {{contribution_description}}

**2 events:**
> Hi {{names}},
> 
> Thank you for supporting ProductTank SF this year. {{contribution_description}}

**1 event:**
> Hi {{names}},
> 
> Thank you for supporting our {{month}} ProductTank SF event. {{contribution_description}}

### Contribution Language

| Type | Language |
|------|----------|
| Venue only | "You hosted {{count}} events at {{company}}, giving our community a welcoming space to connect, learn, and grow together." |
| F&B only | "Your generous sponsorship of food and beverages for our {{months}} events kept our community energized and made networking that much easier." |
| Venue + F&B | "You hosted us {{count}} times at {{company}} and kept everyone fed. You sponsored the full package that makes our events special." |
| Mixed | "You sponsored food and beverages for our {{month}} event, then went above and beyond by hosting us at {{company}} for our {{month}} event." |
| F&B + Videography | "Your sponsorship of food and beverages, plus covering our video production, helped us create content our community can enjoy long after the event ended." |

### Video Section (if URLs exist)
```
I wanted to share the recording(s) from {{those evenings / that evening}} in case {{they are / it is}} useful for your own channels:

- {{month}}: [{{video_title}}]({{youtube_url}})
- {{month}}: We are still finalizing this one and will send the link once it is ready.
```

### Closing
```
We could not have pulled off 2025 without you. We would love to continue working together in 2026.

Thank you again from me and on behalf of Karsh, Melissa, Jerry, Betty, and Glenn.

Best,
Wesley
```

---

## Linear Description Table Format
```markdown
| Sponsor | Type | Events | Contact | Email | Status |
| -- | -- | -- | -- | -- | -- |
| Neon | Venue only | Jan, Apr, Jul, Aug | Teddy | teddy@neon.work | ✅ Sent |
| Joe Gavazza | F&B only | Jan, Apr | Joe | joe@gavazza.com | ⬜ Not sent |
| Product Board | Venue + F&B | Mar, May | ❌ MISSING | ❌ MISSING | 🚫 Blocked |
```

**Status values:**
- `✅ Sent` - Email sent and tracked
- `⬜ Not sent` - Ready to send
- `🚫 Blocked` - Missing contact info

---

## Special Cases

1. **Joint sponsorships** (e.g., "Arize, VAPI" in F&B):
   - Separate emails per company
   - Acknowledge collaboration: "alongside VAPI"

2. **Multiple contacts same company**:
   - All contacts in To: field
   - Address all names in greeting

3. **Individual sponsors** (no company):
   - Don't reference company name
   - Address by name only

---

## Output Format

### On Each Run

1. **Status summary:**
```
   **PRO-194 Status:** X/Y sent, Z blocked
   
   | Status | Sponsors |
   |--------|----------|
   | ✅ Sent | [list] |
   | ⬜ Ready | [list] |
   | 🚫 Blocked | [list with reasons] |
```

2. **Linear updates made** (if any)

3. **Next email draft(s)** - use format above with To/CC/Subject on separate lines

4. **Action needed:**
   - "Send emails, then re-run to track and generate next"
   - Or "All complete" / "Blocked on missing contacts"
~~~
