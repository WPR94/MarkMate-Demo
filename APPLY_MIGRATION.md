# 🚀 Apply Rubric Migration

> ⚠️ If you saw `syntax error at or near "##"` you pasted the entire Markdown file into the SQL editor. Only run the SQL code block below – NOT the headings or explanatory text.

## ✅ Copy ONLY This SQL (no markdown)

```sql
ALTER TABLE public.rubrics
ADD COLUMN IF NOT EXISTS exam_board text,
ADD COLUMN IF NOT EXISTS template_id text,
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS cloned_from uuid REFERENCES public.rubrics(id);

CREATE INDEX IF NOT EXISTS idx_rubrics_exam_board ON public.rubrics(exam_board);
```

After running that, continue with the rest of the guide below.

## What This Migration Does

Adds columns to the `rubrics` table to support:

- **exam_board**: Store GCSE exam board (AQA, Edexcel, OCR, WJEC)
- **template_id**: Link to GCSE templates
- **version**: Track rubric versions (default: 1)
- **cloned_from**: Reference to original rubric when cloning

## ⚡ Quick Apply (Supabase Dashboard)

1. Open your Supabase project: [Supabase Dashboard](https://supabase.com/dashboard)
1. Navigate to **SQL Editor** (left sidebar)
1. Click **New Query**
1. Paste the following SQL:

```sql
-- Migration: Add rubric metadata columns for exam board & template reference
ALTER TABLE public.rubrics
ADD COLUMN IF NOT EXISTS exam_board text,
ADD COLUMN IF NOT EXISTS template_id text,
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS cloned_from uuid REFERENCES public.rubrics(id);

-- Helpful index for filtering by exam board
CREATE INDEX IF NOT EXISTS idx_rubrics_exam_board ON public.rubrics(exam_board);
```

1. Click **Run** (or press Ctrl+Enter)
1. Verify success message: "Success. No rows returned"

## ✅ Test It Works

After applying:

1. Go to **MarkMate** → **Rubrics** page
1. Create a new rubric with exam board selected (e.g., AQA)
1. Click **Save Rubric**
1. Should save without errors
1. Click **Clone** button → Creates version 2
1. Clone again → Creates version 3

## 🔍 Verify Migration

In Supabase SQL Editor:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'rubrics'
AND column_name IN ('exam_board', 'template_id', 'version', 'cloned_from');
```

Should return 4 rows showing the new columns.

## 🐛 Troubleshooting

### Error: "Could not find the 'exam_board' column"

- Migration hasn't been applied yet
- Follow steps above to apply

### Error: "permission denied"

- Make sure you're the project owner or have ALTER TABLE permissions
- Try from Supabase dashboard (not CLI)

### Error: "relation 'rubrics' does not exist"

- Run the main schema first: `supabase/schema.sql`

## 📝 What Changes

Before:

```sql
rubrics (
  id uuid,
  name text,
  subject text,
  criteria jsonb,
  teacher_id uuid
)
```

After:

```sql
rubrics (
  id uuid,
  name text,
  subject text,
  criteria jsonb,
  teacher_id uuid,
  exam_board text,          -- NEW
  template_id text,         -- NEW
  version integer,          -- NEW (default: 1)
  cloned_from uuid          -- NEW (references rubrics.id)
)
```

## 🎯 Impact

- **No data loss**: Existing rubrics unaffected (new columns nullable or have defaults)
- **Backwards compatible**: Old rubrics work fine with NULL values
- **Clone tracking**: Can trace rubric lineage (v1 → v2 → v3)
- **Exam board filtering**: Can query by exam board for analytics

---

**Status**: Migration file ready in `supabase/migrations/20251120153500_add_rubric_metadata.sql`  
**Safe to apply**: Yes (idempotent with `IF NOT EXISTS`)  
**Rollback**: Drop columns if needed (not recommended after data inserted)
