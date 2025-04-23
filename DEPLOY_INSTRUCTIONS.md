# Deployment Instructions

## Setting Up GitHub Secrets for Firebase Configuration

To deploy this app on GitHub Pages while keeping your Firebase configuration secure, follow these steps:

1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables" → "Actions"
4. Click "New repository secret" and add each of the following secrets from your firebase-config.js file:

   - FIREBASE_API_KEY
   - FIREBASE_AUTH_DOMAIN
   - FIREBASE_PROJECT_ID
   - FIREBASE_STORAGE_BUCKET
   - FIREBASE_MESSAGING_SENDER_ID
   - FIREBASE_APP_ID
   - FIREBASE_MEASUREMENT_ID

5. The value for each secret should be taken from your local `firebase-config.js` file.

## Deploying

After setting up the secrets:

1. Push your code to the main branch of your GitHub repository
2. GitHub Actions will automatically build and deploy your site to GitHub Pages
3. Your app will be available at `https://[your-username].github.io/[your-repo-name]/`

## Local Development

For local development, simply keep your `firebase-config.js` file in your local repository. It will not be pushed to GitHub because it's listed in `.gitignore`.

When a collaborator clones the repository, they should:

1. Create their own `firebase-config.js` file based on the `firebase-config.example.js` template
2. Add their own Firebase configuration details to the file