# Durham Fusion Society

A site for the society: events, members, sponsors, a newsletter list, and an admin desk. Accounts and data live in Supabase.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Connect Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/migrations/20261016170000_society.sql`.
3. Replace the placeholder admin **before anyone signs up**:

```sql
delete from private.admin_emails where email = 'change-me@durham.ac.uk';
insert into private.admin_emails (email) values ('you@durham.ac.uk');
```

4. In Project Settings → API, copy the project URL and the publishable key (the anon key works in the same variable) into `.env.local`.
5. In Authentication → URL configuration, set Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` as a redirect URL.
6. Restart `npm run dev`, then open **Join** with the admin email.

If that account already exists as a normal member, promote it from the SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@durham.ac.uk';
```

Admins can publish events, committee seats, sponsors, the programme, and the footer line. Members can edit their own name, course, and bio, see the directory, and RSVP. Role changes are ignored unless an admin makes them.
