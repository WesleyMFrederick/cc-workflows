
# PTSF Email Thread Export Prompt

Copy and paste the prompt below into a conversation where you have access to the Gmail thread.

## Prompt

Read the Gmail thread with ID `[THREAD_ID]` and output a single markdown document with two sections: YAML frontmatter and a JSON code block containing the structured thread data.

### Output format

The document should look exactly like this structure:

~~~markdown
---
source: gmail
thread_id: "[thread_id]"
subject: "[subject line]"
event: "ProductTank SF - [Month Year]"
event_date: YYYY-MM-DD
speaker: "[speaker name if applicable, omit field if not]"
talk_title: "[talk title if applicable, omit field if not]"
venue: "[venue name(s)]"
description: |
  [2-5 sentence description of what the thread covers. Include the arc of the conversation: what it starts with, key decision points, and where it ends. Reference specific logistics, dates, and outcomes.]
summary: |
  [Detailed narrative summary, 4-8 sentences. Cover the full chronological progression of the thread. Name specific people and their actions. Include dates, dollar amounts, and concrete outcomes. End with the current state or next steps as of the last message.]
participants:
  - name: "[Full Name]"
    email: "[email]"
    role: [organizer|speaker|sponsor-contact|sponsor-leadership|intro|venue-contact|vendor]
message_count: [N]
date_range:
  first: YYYY-MM-DD
  last: YYYY-MM-DD
exported: [today's date YYYY-MM-DD]
---

```json
{
  "thread_id": "[thread_id]",
  "subject": "[subject line]",
  "message": {
    "message_id": "[first message id]",
    "date": "[ISO 8601]",
    "user_name": "[sender name]",
    "user_email": "[sender email]",
    "to": [
      { "name": "[name]", "email": "[email]" }
    ],
    "cc": [
      { "name": "[name]", "email": "[email]" }
    ],
    "body": "[message body text, no quoted replies]",
    "replies": [
      {
        "message_id": "[id]",
        "date": "[ISO 8601]",
        "user_name": "[sender name]",
        "user_email": "[sender email]",
        "to": [
          { "name": "[name]", "email": "[email]" }
        ],
        "body": "[message body text, no quoted replies]"
      }
    ]
  }
}
```
~~~

### Rules for the JSON

1. **Flat replies structure.** The first message in the thread is the parent `message`. Every subsequent message is a direct child in the `replies` array. Do not nest replies inside other replies.
2. **Extract only new content.** Each message `body` should contain only the new text the sender wrote. Strip out all quoted reply content (the `>` prefixed text, “On [date] [person] wrote:” blocks, and forwarded message headers that repeat earlier content).
3. **Preserve email signatures** in the body only if they contain useful contact info (phone numbers, titles). Strip generic sign-offs that are just a name.
4. **Include `to`, `cc`, and `bcc` fields** only when present in the message headers. Omit empty arrays. The `to` field is always required.
5. **Use ISO 8601 dates** with timezone (Z for UTC). Convert from the email Date header.
6. **If Gmail groups two distinct messages** from different senders under one message ID, split them into separate entries in the replies array. Append a letter suffix (e.g., `a`, `b`) to the message_id to disambiguate.
7. **Forwarded messages:** If a message is a forward (not a reply), include the forward context in the body. The `to` field should reflect the forward recipients, not the original thread participants.

### Rules for the frontmatter

1. **`event`** should follow the pattern “ProductTank SF - [Month Year]”. If the thread spans multiple events, list them separated by “ / “.
2. **`event_date`** is the actual or planned event date. If the event shifted, use the final confirmed date.
3. **`speaker` and `talk_title`** should only appear if the thread is about speaker coordination. Omit these fields entirely for sponsor-only, logistics-only, or other thread types.
4. **`venue`** should reflect the venue(s) discussed. If a venue changed, note the progression (e.g., “Mixpanel (attempted) / Cribl (actual)”).
5. **`participants`** should list every unique person who sent a message in the thread. Use these roles:
- `organizer` - ProductTank SF team members (Karsh, Betty, Melissa, Jerry, Wesley)
- `speaker` - Event speaker
- `sponsor-contact` - Primary sponsor point of contact
- `sponsor-leadership` - Sponsor decision-maker who appeared for approvals
- `intro` - Person who made an introduction then dropped off
- `venue-contact` - Venue logistics contact
- `vendor` - Service providers (videographer, caterer, etc.)
1. **`description`** is a concise overview (2-5 sentences). Think of it as the “what does this thread cover” summary.
2. **`summary`** is a detailed narrative (4-8 sentences). Think of it as “what happened in this thread, chronologically, with specifics.”
3. **`exported`** is today’s date when you run the export.

### Known PTSF team emails

Use these to identify organizer roles:

- Karsh: karsh.pandey@gmail.com
- Betty Margulies: emargulies@gmail.com
- Melissa Hsu: melissahsu2016@gmail.com
- Jerry Young: jerryjyoung@gmail.com
- Wesley Frederick: wmfrederick@gmail.com / wmfrederick+producttanksf@gmail.com
- Warren Kawamoto: (videographer/vendor)

### Execution

1. Call `read_gmail_thread` with the thread ID and `include_full_messages: true`
2. Parse all messages in chronological order
3. Extract clean body text from each message (strip quoted replies)
4. Build the frontmatter from your analysis of the thread content
5. Build the JSON structure
6. Output as a single markdown document

Save the output as `[thread_id].md`.
~~~