# StudyBuddy

StudyBuddy is an AI-powered study companion built to make exam preparation simpler and more efficient. Users upload the PDF material they need to study, and StudyBuddy turns it into:

- Clear explanations
- Flashcards
- Quizzes


## Live Demo

[Open StudyBuddy](https://studybuddy-beta-neon.vercel.app)


## Features

- User authentication with email verification
- Create and manage study sets
- Upload PDF study materials
- Automatically extract text from uploaded PDFs
- Generate simplified AI explanations
- Generate flashcards from study material
- Generate multiple-choice quizzes
- Regenerate explanations, flashcards, and quizzes
- Save generated study content for later use
- Responsive design for desktop and mobile


## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- React Markdown
- KaTeX

### Backend
- Node.js
- Express
- TypeScript
- Zod
- pdf-parse
- OpenAI API

### Database & Authentication
- Supabase Database
- Supabase Auth
- Supabase Storage
- Row Level Security (RLS)

### Deployment
- Vercel — frontend
- Render — backend


## Architecture

StudyBuddy follows a client-server architecture:

```text
React + TypeScript Frontend
        |
        v
Express + TypeScript Backend
        |
        +------------------+
        |                  |
        v                  v
    Supabase            OpenAI API
    - Auth
    - Database
    - Storage
```

## How It Works

1. The user creates an account or logs in.
2. The user creates a study set.
3. A PDF study material is uploaded to Supabase Storage.
4. The backend extracts text from the PDF.
5. The extracted text is stored and used as input for AI generation.
6. The user can generate:
   - Explanations
   - Flashcards
   - Quizzes
7. Generated content is saved to the database so it can be revisited later.


## Screenshots

### Landing Page
![StudyBuddy Landing Page](screenshots/landing-page.png)

### Dashboard
![StudyBuddy Dashboard](screenshots/dashboard.png)

### Explanation
![StudyBuddy Explanation Mode](screenshots/explanation-view.png)

### Flashcards
![StudyBuddy Flashcards Mode](screenshots/flashcards-view.png)

### Quiz
![StudyBuddy Quiz Mode](screenshots/quiz-view.png)
