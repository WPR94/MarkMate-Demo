# 🚀 QUICK START - Test Account

## 📧 Login Credentials
```
Email: teacher.demo@markmate.test
Password: MarkMate2024!
```

## ⚡ 5-Minute Setup

1. **Start Dev Server**
   ```bash
   npm run dev
   ```
   Open: http://localhost:5173

2. **Create Account**
   - Go to `/auth`
   - Click "Sign Up"
   - Use credentials above
   - (Verify email in Supabase if required)

3. **Upload Sample Rubric**
   - Go to `/rubrics`
   - Click "Upload Rubric"
   - Upload: `sample-rubric.txt` from project root
   - Or manually add with these criteria:
     - Content & Ideas (25 points)
     - Structure & Organization (20 points)
     - Language & Style (20 points)
     - Grammar & Mechanics (20 points)
     - Analysis & Critical Thinking (15 points)

4. **Import Students**
   - Go to `/students`
   - Click "Import CSV"
   - Upload: `test-data/sample-students.csv`
   - Should import 5 students

5. **Grade Sample Essays**
   - Go to `/essay-feedback`
   - Upload: `test-data/emma_climate_essay.txt`
   - Select your rubric
   - Select "Emma Wilson" as student
   - Click "Generate AI Feedback"
   - Repeat with other essays

6. **Try Batch Processing**
   - Go to `/batch`
   - Upload multiple essays from `test-data/` folder
   - Select rubric
   - Let students auto-match or assign manually
   - Click "Start Processing"

7. **Check Analytics**
   - Go to `/analytics`
   - View grade distribution, trends, rubric performance

---

## 📁 Test Files Location

```
markmate/
├── sample-rubric.txt          # Ready-to-upload rubric
├── test-data/
│   ├── sample-students.csv    # 5 students for import
│   ├── emma_climate_essay.txt
│   ├── james_short_story.txt
│   └── sophia_social_media_essay.txt
└── TEST_ACCOUNT.md            # Full documentation
```

---

## 🎯 Key Features to Test

✅ Upload essay (.txt, .docx, .pdf)
✅ Scan essay (image with OCR)
✅ Batch process (multiple essays at once)
✅ CSV import (students in bulk)
✅ Analytics charts
✅ Search & filter feedback history

---

## 🔧 Troubleshooting

**No AI feedback?**
- Check OPENAI_API_KEY in Supabase Edge Function

**Can't sign up?**
- Check Supabase Auth settings
- Disable email confirmation for testing

**Dashboard empty?**
- Make sure you uploaded rubric & graded essays
- Check RLS policies in Supabase

---

## 📊 What Success Looks Like

After setup, you should see:
- Dashboard: 3+ essays, 1+ rubric, 5 students
- Analytics: Grade distribution chart with data
- Feedback History: List of graded essays
- Students: 5 active students

---

**Need help? Check TEST_ACCOUNT.md for detailed guide**
