# Quiz Project Web

A simple web application for displaying and taking quizzes without using any frameworks.

## Features

- Display a list of quizzes from the data folder
- Take quizzes with multiple-choice questions
- Track your score as you progress
- View results at the end of each quiz
- Retake quizzes to improve your score
- URL-based navigation (each quiz and question has its own URL)
- Browser history support (back/forward navigation)
- Responsive design that works on mobile and desktop

## Getting Started

### Opening directly in a browser

The simplest way to run this application:

1. Download all the files
2. Double-click the `index.html` file to open it directly in your web browser

### Using a simple local server (optional)

For better experience with file loading, you can use a simple server:

- **With Python (Python 3):**
  ```
  python -m http.server
  ```

- **With VS Code:**
  Install the "Live Server" extension and click "Go Live" in the status bar

Then open your browser and navigate to the URL provided (typically `http://localhost:8000` or `http://127.0.0.1:5500`).

## Project Structure

```
quiz_project_web/
│
├── index.html        # Main HTML file
├── styles.css        # CSS styles
├── scripts.js        # JavaScript for quiz functionality
├── 404.html          # 404 error page
│
├── data/
│   ├── quiz_metadata.json    # Metadata for all quizzes
│   ├── quiz_chunk_1_updated.json
│   ├── quiz_chunk_2_updated.json
│   └── ... other quiz files
│
└── README.md         # This file
```

## URL Structure

The application uses URL hash-based routing to enable browser navigation:

- Home page: `index.html` or `index.html#`
- Quiz page: `index.html#quiz/[quiz-id]`
- Specific question: `index.html#quiz/[quiz-id]/[question-index]`
- Results page: `index.html#quiz/[quiz-id]/results`

This allows users to bookmark specific quizzes or questions and use the browser's back/forward buttons to navigate.

## Adding New Quizzes

To add a new quiz:

1. Create a new JSON file in the `data` folder with your quiz questions following the same format as existing quizzes
2. Update the `quiz_metadata.json` file to include your new quiz with the following information:
   ```json
   {
     "id": 7,  // Increment from the last ID
     "filename": "your_new_quiz.json",
     "title": "Your Quiz Title",
     "theme": "your_quiz_theme",
     "description": "A short description of your quiz"
   }
   ```

## Quiz JSON Format

Each quiz file should contain an array of question objects with the following structure:

```json
[
  {
    "id": 1,
    "expression": "The question text",
    "options": [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    "answer_index": 0,  // Index of the correct answer (0-based)
    "exemple": "An example sentence",
    "theme": "theme_name",
    // ... other optional properties
  },
  // ... more questions
]
```

## Browser Support

This application uses modern JavaScript features including:
- Fetch API
- Async/await
- ES6 features (arrow functions, template literals, etc.)

For best experience, use the latest versions of modern browsers like Chrome, Firefox, Safari, or Edge.

## License

This project is open source and available for personal and educational use.

## Setup

### Firebase Configuration

This app uses Firebase for authentication and storing user data. To set up:

1. Create a project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password and Anonymous authentication providers
3. Create a Firestore database
4. Copy `firebase-config.example.js` to `firebase-config.js` and update with your project details:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### Running the App

The app can be run locally using a simple web server:

```bash
# Using Python
python -m http.server

# Or any other web server of your choice
```

## Security Note

The `firebase-config.js` file contains your Firebase API keys and should not be committed to public repositories. It is included in the `.gitignore` file by default.