## Task: Create Speaker Thank You Email Drafts

### Gmail Account
Create all drafts in: <wmfrederick+producttanksf@gmail.com>

### Data Source
Read the ProductTank SF Events Tracker spreadsheet:
<https://docs.google.com/spreadsheets/d/1RnNx_kF0YsaiG2VlcgMO1oVs56rjKBIxtQKjVsvwq2o/edit>

From the "Next Events" sheet, extract 2025 speakers with:
- Speaker first name (Column AA)
- Speaker email (Column AB)
- Event month (from Column A date)
- Venue (Column Q)
- Talk theme (Column D)
- Video title (Column H) - only if populated
- YouTube URL (Column I) - only if actual URL exists, not placeholder text

### Email Template
Subject: Thank You for Speaking at ProductTank SF in 2025

Hi {{speaker_first_name}},

Thank you for speaking at our {{month}} event at {{venue}}. Your talk on {{summary talk_theme, 2-4 words max, in lower case}} was fantastic. The audience was engaged throughout.

Here's the link to your talk on YouTube: [{{video_title}}]({{youtube_url}})

The entire ProductTank community appreciates your willingness to contribute. We'd love to work with you again in the future, whether that's another talk, a panel, or just staying connected with the ProductTank SF community.

Thank you again from me and on behalf of Karsh, Melissa, Jerry, Betty, and Glenn.

Best,
Wesley

### Instructions
1. Filter to 2025 events only
2. Skip speakers without email addresses
3. If no YouTube URL exists, omit the YouTube paragraph entirely
4. Create a Gmail draft for each speaker (do not send)
5. Report which drafts were created and any speakers skipped (with reason)
