# IBHack008

A modern React application built with Vite and Tailwind CSS.

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 16.0 or higher)
- **npm** (comes with Node.js)

You can check if you have Node.js and npm installed by running:
```bash
node --version
npm --version
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ibhack008
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

To start the development server:
```bash
npm run dev
```

This will start the Vite development server, typically at `http://localhost:5173`. The page will automatically reload when you make changes to the code.

### Production Build

To create a production build:
```bash
npm run build
```

The built files will be generated in the `dist/` directory.

### Preview Production Build

To preview the production build locally:
```bash
npm run preview
```

### Linting

To run ESLint and check for code quality issues:
```bash
npm run lint
```

## Project Structure

```
ibhack008/
├── public/                 # Static assets
│   └── vite.svg
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── Dashboard.jsx
│   │   ├── Hero.jsx
│   │   ├── HomeCards.jsx
│   │   ├── Navbar.jsx
│   │   └── Team.jsx
│   ├── assets/            # Assets (images, etc.)
│   │   └── images/
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── eslint.config.js       # ESLint configuration
```

## Technologies Used

- **React** (v19.1.1) - UI library
- **Vite** (v7.1.2) - Build tool and development server
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework
- **React Router DOM** (v7.9.1) - Client-side routing
- **Lucide React** - Icon library
- **ESLint** - Code linting and formatting

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts development server |
| `npm run build` | Creates production build |
| `npm run preview` | Previews production build |
| `npm run lint` | Runs ESLint |

## Development

1. Start the development server: `npm run dev`
2. Open your browser and navigate to the local development URL (usually `http://localhost:5173`)
3. Make your changes - the page will automatically reload
4. Before committing, run `npm run lint` to check for any code quality issues

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port (5174, 5175, etc.).

### Dependencies Issues
If you encounter dependency-related issues, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Node Version Issues
Make sure you're using Node.js version 16 or higher. You can use a Node version manager like `nvm` to switch between versions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not currently licensed for public use.