# রোগ-নির্ণয় | Vercel-ready project

A Bengali educational health platform with symptom checker, doctor finder, appointment booking, and patient/doctor/admin dashboards.

## Important: upload the CONTENTS of this folder to the GitHub repository root

Correct repository layout:

```text
index.html
app.js
config.js
geo.js
model.js
schema.sql
vercel.json
README.md
train/
```

Do not upload this folder as an extra nested `rogo-nirnoy/rogo-nirnoy/` directory. Vercel must see `index.html` at the repository root.

## Deploy to Vercel

1. Import the GitHub repository.
2. Framework Preset: **Other**.
3. Root Directory: `.` (repository root).
4. Build Command: leave empty / override OFF.
5. Output Directory: leave empty or `.`; override OFF.
6. Install Command: leave empty / override OFF.
7. Deploy.

If the project was previously imported with Root Directory set to `rogo-nirnoy`, change it to `.` (or clear the custom Root Directory) because this package has a flat root.

## Supabase setup

The symptom checker demo works without Supabase. Login, signup, doctor search, appointments, and dashboards require Supabase.

1. Create a Supabase project.
2. Run `schema.sql` in Supabase SQL Editor.
3. Copy the Project URL and anon/publishable public key from Project Settings → API.
4. Paste them into `config.js`:

```js
window.CONFIG = {
  SUPABASE_URL: "https://YOUR_PROJECT_ID.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY"
};
```

Never put a Supabase `service_role` or secret key in frontend code or GitHub. Keep Row Level Security enabled.

## Medical notice

This is an educational symptom-information tool, not a diagnostic system and not a substitute for a licensed clinician. Its suggested matches are not validated clinical probabilities. Seek qualified medical care for health concerns; for emergencies in Bangladesh call 999.
