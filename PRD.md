# Product Requirements Document (PRD)

**Product:** Simple Rubriq  
**Version:** 1.1  
**Author:** Wilson Roserie  
**Date:** November 2025

---

## Executive Summary

Simple Rubriq is an AI-powered grading assistant built to help teachers mark essays automatically using their own grading rubrics. It analyses essays line by line, compares them to uploaded rubrics, assigns per-criterion scores, and provides clear explanations and highlights.

---

## Goals and Objectives

### Primary Goals:
- Automate essay marking with AI-driven rubric alignment.
- Deliver structured, fair, and consistent grades.
- Save teachers time while improving marking accuracy.

### Secondary Goals:
- Accept multiple file types (.docx, .pdf, .txt, scanned papers via OCR).
- Enable rubric upload, creation, and editing.
- Provide analytics for grading patterns and student progress.
- Offer a modern, responsive, and accessible user experience.

---

## Target Users

- **Teachers:** Primary users (starting with GCSE/O-Level English).
- **Students (future):** Access teacher feedback and grading summaries.
- **School Administrators (future):** Track class performance and grading consistency.

---

## Core Features

1. **AI Grading Engine:** Automatically assigns marks per rubric criterion.
2. **Rubric Upload & Parsing:** Teachers upload a rubric (text, PDF, DOCX) and it converts to JSON.
3. **Rubric-Aligned Feedback:** Matches essay sentences to rubric criteria.
4. **Overall Score Calculation:** Computes per-criterion and total grade.
5. **Feedback Explanation:** Generates comments explaining each score.
6. **Essay Upload & OCR:** Upload typed or scanned essays.
7. **Authentication:** Supabase login/signup for teachers.
8. **Feedback History & Analytics:** Store essays, grades, and visualize trends.
9. **Demo Mode:** Public demo with mock AI feedback.

---

## Technical Architecture

- **Frontend:** React + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **AI Engine:** OpenAI GPT-4
- **OCR:** Tesseract.js / Supabase Edge Plugin
- **Deployment:** Vercel
- **Styling:** Tailwind CSS
- **Analytics:** Recharts

---

## Guiding Principle

> **Simple Rubriq exists to give teachers back their time — allowing them to focus on nurturing minds, not marking piles.**
