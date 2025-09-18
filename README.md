# Booking System

A simple and elegant booking system with an interactive calendar interface.

## Features

- Clean, responsive booking form
- Interactive calendar for date selection
- Time slot selection
- Form validation
- Mobile-friendly design

## Quick Start

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser to `http://localhost:3001`

### Deployment

This application is ready to deploy to any platform that supports Node.js:

#### Heroku
```bash
git add .
git commit -m "Ready for deployment"
heroku create your-app-name
git push heroku main
```

#### Railway
1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Node.js app and deploy

#### Render
1. Connect your GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`

#### Vercel/Netlify
For these platforms, you may need to configure them for Node.js applications.

## Environment Variables

- `PORT`: Server port (defaults to 3001 for local development)
- `NODE_ENV`: Set to 'production' for production deployments

## File Structure

```
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── Procfile          # Heroku deployment configuration
├── .nvmrc            # Node.js version specification
└── public/           # Static files
    ├── index.html    # Main booking form
    ├── main.js       # Client-side JavaScript
    ├── site.css      # Form styling
    └── style.css     # Calendar styling
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome