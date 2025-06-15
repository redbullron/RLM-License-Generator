# Development Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/redbullron/RLM-License-Generator.git
cd RLM-License-Generator
```

2. Install dependencies:
```bash
npm install
```

## Development

### Running in Development Mode

Start the development server:
```bash
npm run dev
```

This will start both the Vite development server and Electron in development mode with hot reload.

### Building the Application

Build for production:
```bash
npm run build
```

### Building Electron App

Build the Electron application:
```bash
npm run electron:build
```

This will create distributable packages in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── FileOperations.tsx
│   ├── LicensePreview.tsx
│   ├── ProductList.tsx
│   ├── ServerInfo.tsx
│   └── ...
├── store/              # Zustand state management
│   └── licenseStore.ts
├── types/              # TypeScript type definitions
│   ├── index.ts
│   └── electron.d.ts
├── utils/              # Utility functions
│   ├── muiUtils.ts
│   └── electronFileUtils.ts
├── lib/                # Library utilities
│   └── utils.ts
├── assets/             # Static assets
├── App.tsx             # Main React component
├── main.tsx            # React entry point
└── styles.css          # Global styles

electron/
├── main.cjs            # Electron main process
└── preload.cjs         # Electron preload script
```

## Key Features

- **Server Configuration**: Set up RLM server details (hostname, MAC address, ports)
- **Product Management**: Add and configure license products with dependencies
- **License Generation**: Generate RLM-compatible license files
- **File Operations**: Load existing license files and save generated ones
- **Search Functionality**: Search for license files in directories
- **Theme Support**: Light and dark mode themes
- **Drag & Drop**: Drag license files directly into the application

## Technologies Used

- **Frontend**: React 18, TypeScript, Material-UI, Tailwind CSS
- **State Management**: Zustand with persistence
- **Desktop**: Electron with secure IPC communication
- **Build Tools**: Vite, Electron Builder/Forge
- **Date Handling**: date-fns, MUI Date Pickers
- **File Operations**: file-saver for browser downloads

## Development Tips

1. **Hot Reload**: The development server supports hot reload for both React and Electron
2. **DevTools**: Electron DevTools are available in development mode
3. **State Persistence**: Application state is automatically saved to localStorage
4. **File Handling**: The app supports both Electron file APIs and browser fallbacks
5. **Theming**: Use Material-UI's theme system for consistent styling

## Troubleshooting

### Common Issues

1. **Node modules not found**: Run `npm install` to ensure all dependencies are installed
2. **Electron not starting**: Check that all Electron dependencies are properly installed
3. **Build failures**: Ensure you're using Node.js 18+ and have the latest npm version
4. **File operations not working**: Verify Electron APIs are properly exposed in preload script

### Debug Mode

To run with additional debugging:
```bash
npm run dev -- --debug
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.