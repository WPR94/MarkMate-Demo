# Test Account Setup Guide

## 📧 Test Account Credentials

**Email:** `teacher.demo@markmate.test`  
**Password:** `MarkMate2024!`

---

## 🚀 Quick Start

### Option 1: Manual Setup (Recommended)

1. **Sign Up:**
   - Go to http://localhost:5173/auth
   - Click "Sign Up"
   - Enter email: `teacher.demo@markmate.test`
   - Enter password: `MarkMate2024!`
   - Confirm sign up

2. **Verify Email (If Required):**
   - Check your Supabase dashboard → Authentication → Users
   - Click on the user and manually verify if needed

3. **Add Sample Data:**
   - Use the scripts below to populate sample data

---

## 📝 Sample Data Scripts

### 1. Create Sample Rubric

Go to `/rubrics` and add this rubric:

**Name:** GCSE English Essay Rubric  
**Subject:** English

**Criteria:**
```
Content & Ideas (25 points): Clear thesis, well-developed arguments, relevant examples
Structure & Organization (20 points): Logical flow, clear paragraphs, effective transitions
Language & Style (20 points): Varied vocabulary, appropriate tone, engaging writing
Grammar & Mechanics (20 points): Correct spelling, punctuation, and sentence structure
Analysis & Critical Thinking (15 points): Depth of analysis, interpretation, critical evaluation
```

**Or upload this file:**

Create a file named `sample-rubric.txt` with:
```
GCSE English Essay Rubric

Content & Ideas (25 points): Clear thesis statement, well-developed arguments, and relevant supporting examples

Structure & Organization (20 points): Logical flow of ideas, clear paragraph structure, and effective transitions between sections

Language & Style (20 points): Varied and appropriate vocabulary, consistent tone, engaging writing style

Grammar & Mechanics (20 points): Correct spelling, punctuation, capitalization, and sentence structure throughout

Analysis & Critical Thinking (15 points): Depth of analysis, thoughtful interpretation, and critical evaluation of sources
```

---

### 2. Create Sample Students

Go to `/students` and add these students individually, or create a CSV file:

**CSV Format** (`sample-students.csv`):
```csv
name,email,grade,class section,student id,notes
Emma Wilson,emma.wilson@student.test,10,A,S001,Strong analytical skills
James Brown,james.brown@student.test,10,A,S002,Needs help with grammar
Sophia Davis,sophia.davis@student.test,10,B,S003,Excellent writer
Oliver Johnson,oliver.johnson@student.test,10,B,S004,Improving steadily
Ava Martinez,ava.martinez@student.test,10,A,S005,Creative thinker
```

Then go to `/students` → **Import CSV** → Upload the file

---

### 3. Create Sample Essays

**Essay 1: Climate Change** (`emma_essay.txt`)
```
Climate Change: A Call to Action

Climate change represents one of the most pressing challenges facing humanity in the 21st century. The overwhelming scientific consensus confirms that human activities, particularly the burning of fossil fuels and deforestation, are causing unprecedented changes to our planet's climate system. This essay will explore the causes, consequences, and potential solutions to this global crisis.

The primary driver of climate change is the emission of greenhouse gases, particularly carbon dioxide and methane, into the atmosphere. Since the Industrial Revolution, atmospheric CO2 levels have risen by over 40%, creating a blanket effect that traps heat and warms the planet. This warming has led to melting ice caps, rising sea levels, and more frequent extreme weather events.

The consequences of climate change are already being felt worldwide. Coastal communities face increasing flood risks, agricultural patterns are shifting, and biodiversity is under threat as species struggle to adapt to changing conditions. The poorest and most vulnerable populations are often hit hardest, despite contributing least to the problem.

Solutions to climate change require coordinated global action on multiple fronts. Transitioning to renewable energy sources, improving energy efficiency, and protecting natural carbon sinks like forests are crucial steps. Individual actions, while important, must be complemented by systemic changes in policy and industry practices.

In conclusion, addressing climate change demands urgent action at all levels of society. The science is clear, and the time for debate has passed. We must act now to secure a sustainable future for generations to come.
```

**Essay 2: Short Story** (`james_essay.txt`)
```
The Last Train Home

Sarah stood on the empty platform watching the clock. It was 11:47 PM and the last train would arrive in three minutes. Around her the station was quiet except for the distant hum of vending machines and the occasional footstep echoing through the corridor.

She checked her phone again. Still no message from Tom. After their argument at dinner she wasn't sure if he'd even want to talk to her tonight. The fight had started over something small how it always did but had quickly escalated into something bigger. Something about trust and honesty and all the things they'd been avoiding for months.

The train pulled into the station with a screech of brakes. Sarah picked up her bag and stepped toward the doors. As they opened she saw him sitting in the second car staring out the window. Their eyes met and for a moment neither of them moved.

Then Tom smiled that familiar crooked smile that had first made her fall in love with him and Sarah knew everything would be okay. Not perfect but okay. She stepped onto the train and the doors closed behind her.
```

Go to `/essay-feedback`:
1. Upload Emma's essay
2. Select the GCSE rubric
3. Select Emma Wilson as student
4. Click "Generate AI Feedback"

Repeat for James's essay with James Brown as student.

---

## 🎯 Features to Test

### Dashboard
- ✅ View essay count, rubric count, recent feedback
- ✅ Click "View All" to see feedback history

### Rubrics
- ✅ Create new rubric manually
- ✅ Upload rubric file (.txt, .docx, .pdf)
- ✅ Edit existing rubric
- ✅ Delete rubric

### Students
- ✅ Add student manually
- ✅ Import students via CSV
- ✅ Edit student information
- ✅ Delete student
- ✅ Mark student as active/inactive

### Essay Feedback
- ✅ Upload essay file (.txt, .docx, .pdf)
- ✅ Use OCR for scanned essays (image files)
- ✅ Select rubric
- ✅ Select student (optional)
- ✅ Generate AI feedback
- ✅ View detailed feedback with scores

### Feedback History
- ✅ Search by essay title
- ✅ Sort by date or score
- ✅ View detailed feedback
- ✅ See student name linked to essay
- ✅ Delete feedback

### Batch Processing
- ✅ Upload multiple essay files
- ✅ Upload ZIP file with essays
- ✅ Auto-match students by filename
- ✅ Manually assign students
- ✅ Select rubric for batch
- ✅ Process all essays with progress tracking
- ✅ Pause/resume processing
- ✅ Export results to CSV
- ✅ Retry failed essays

### Analytics
- ✅ View grade distribution chart
- ✅ View score trends over time
- ✅ View performance by rubric
- ✅ See key metrics (avg score, highest, lowest)

---

## 🔑 Environment Setup

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

And your Supabase Edge Function has the OpenAI API key configured.

---

## 📊 Expected Test Results

After setting up sample data, your dashboard should show:
- **2+ Essays Graded**
- **1+ Rubrics**
- **5+ Students**
- **Recent Feedback** with scores

The Analytics page should display:
- Grade distribution chart
- Score trends
- Rubric performance metrics

---

## 🐛 Troubleshooting

### Authentication Issues
- Check Supabase Auth settings
- Ensure email confirmations are disabled for testing (or verify manually)
- Check browser console for errors

### Data Not Showing
- Verify you're logged in as the correct user
- Check Supabase RLS policies are enabled
- Check browser console for database errors

### AI Feedback Not Working
- Verify Edge Function is deployed
- Check OPENAI_API_KEY is set in Supabase Edge Function secrets
- Check browser network tab for API errors

### File Upload Errors
- Check file sizes (should be reasonable, under 10MB)
- Verify file formats (.txt, .docx, .pdf)
- Check browser console for parsing errors

---

## 🎨 Demo Features

If you want a quick preview without authentication:
- Visit `/dashboard-demo` for a public demo dashboard with mock data
- No sign-in required
- Shows all UI components with sample statistics

---

## 📝 Notes

- The test account is for development/testing only
- Don't use this account in production
- Sample data is fictional
- OpenAI API calls will consume credits
- PDF parsing requires a modern browser with good JavaScript support

---

## 🚀 Next Steps

After testing:
1. Deploy to production (Vercel recommended)
2. Set up custom domain
3. Configure production Supabase project
4. Set up automated database backups
5. Monitor OpenAI API usage
6. Set up analytics tracking
7. Add rate limiting for API calls

---

**Happy Testing! 🎉**
