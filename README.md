# ClientFlow v2 — Public Acquisition Link + CRM

## Pages
- `public.html` — customer-facing acquisition form
- `index.html` — internal acquisition CRM

## Important
A true public link used by customers on different phones needs a cloud database.
This package supports Supabase.

### 1. Create Supabase project
Create a Supabase project, then open its SQL Editor and run `supabase_setup.sql`.

### 2. Add credentials
Open `config.js` and paste:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- your WhatsApp number

The public anon key is designed to be used in browser apps. Never place the Supabase service-role key in this project.

### 3. Admin access warning
The included database policy allows public visitors to INSERT only. They cannot read your leads.
Reading/editing is intended for authenticated staff. Before making the admin CRM public, add Supabase Auth/login.

### 4. Deploy
Upload these files to a static host such as Netlify, Vercel or Cloudflare Pages.

Your public link can then look like:
`https://clients.yourdomain.com/public.html?utm_source=TikTok&utm_campaign=iphone15`

Use different source URLs:
- TikTok: `?utm_source=TikTok`
- WhatsApp Status: `?utm_source=WhatsApp`
- Flyer QR: `?utm_source=QR_Flyer`
- Shop: `?utm_source=Shop_QR`

That lets the CRM show where each enquiry came from.

## Qualification rule
Public submissions always enter as Enquirer.
Staff promotes:
Enquirer -> Potential Client -> Client

## Recommended next production upgrades
1. Staff login + permissions
2. Duplicate lead handling on the database
3. WhatsApp/SMS automation
4. Lead scoring
5. Activity log
6. Conversion reporting by source and staff owner
7. Privacy policy page and retention policy
