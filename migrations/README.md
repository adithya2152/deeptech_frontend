# Database Migration: Add Domains Column

## Issue
Profile updates are failing when trying to save domains for expert users because the `domains` column doesn't exist in the Supabase `profiles` table.

## Solution
Run the SQL migration to add the `domains` column as a `text[]` (array of text).

## Steps to Apply

### Option 1: Run in Supabase SQL Editor (Recommended)
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vcxrqnkfuufvyiztunwi
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `migrations/add_domains_column.sql`
5. Click **Run** or press `Ctrl+Enter`
6. You should see: `✅ domains column added successfully to profiles table`

### Option 2: Using Supabase CLI (If installed)
```bash
cd deeptech
supabase db push migrations/add_domains_column.sql
```

## What This Migration Does

1. **Adds `domains` column** - Creates a new column of type `text[]` to store multiple domain values
2. **Adds documentation** - Comments explain the purpose of the column
3. **Creates GIN index** - Optimizes searches for profiles by domain (useful for expert discovery filters)
4. **Verifies success** - Outputs confirmation message

## After Migration

Once the migration is complete:

1. Refresh your application (http://localhost:8081)
2. The schema checker will log: `✅ Domains column exists`
3. Expert users can now:
   - Select domains during registration
   - Update domains in their profile
   - Domain changes will save successfully

## Testing

After running the migration, test by:

1. Log in as an expert user
2. Go to Profile page
3. Click Edit
4. Select/deselect domains
5. Click Save Changes
6. Verify no error toast appears and domains are saved

## Rollback (If Needed)

To remove the domains column:
```sql
ALTER TABLE profiles DROP COLUMN IF EXISTS domains;
DROP INDEX IF EXISTS idx_profiles_domains;
```

⚠️ **Warning**: This will delete all domain data for expert users.
