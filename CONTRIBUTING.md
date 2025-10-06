# Contributing to Run:AI VSCode Extension

Thank you for your interest in contributing to the Run:AI VSCode Extension! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm 8.x or higher
- Visual Studio Code 1.104.0 or higher
- Git

### Setting Up Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/runai-vscode-extension.git
   cd runai-vscode-extension
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/your-org/runai-vscode-extension.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Compile TypeScript:
   ```bash
   npm run compile
   ```

## Development Workflow

### Running the Extension

1. Open the project in VSCode
2. Press F5 to launch the Extension Development Host
3. A new VSCode window opens with the extension loaded
4. Make changes to the code
5. Reload the Extension Development Host to see changes

### Watching for Changes

Run the TypeScript compiler in watch mode:
```bash
npm run watch
```

This automatically recompiles when you save files.

### Testing

Run the test suite:
```bash
npm test
```

Run linting:
```bash
npm run lint
```

## Code Style

### TypeScript Guidelines

- Use TypeScript for all new code
- Enable strict type checking
- Avoid using `any` - use proper types
- Use interfaces for object shapes
- Document public APIs with JSDoc comments

### Formatting

- Use 4 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Run ESLint to check code style

### Naming Conventions

- **Variables/Functions**: camelCase (`getUserData`, `workloadCount`)
- **Classes/Interfaces**: PascalCase (`WorkloadProvider`, `RunAIClient`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Files**: camelCase for utilities, PascalCase for classes

## Project Structure

```
runai-vscode-extension/
├── src/
│   ├── api/              # API client and interfaces
│   │   └── client.ts     # Run:AI REST API client
│   ├── providers/        # Tree view providers
│   │   ├── workloadsProvider.ts
│   │   ├── projectsProvider.ts
│   │   └── clustersProvider.ts
│   ├── extension.ts      # Extension entry point
│   └── test/            # Test files
├── resources/           # Icons and static assets
├── docs/               # Documentation
├── .vscode/            # VSCode config
├── package.json        # Extension manifest
└── tsconfig.json       # TypeScript config
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-logs-viewer` - New features
- `fix/workload-deletion-bug` - Bug fixes
- `docs/update-readme` - Documentation updates
- `refactor/api-client` - Code refactoring

### Commit Messages

Write clear, descriptive commit messages:

```
type: Short description (50 chars or less)

Longer explanation if needed. Wrap at 72 characters.
Explain what and why, not how.

- Bullet points are okay
- Use present tense: "Add feature" not "Added feature"
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tools

Examples:
```
feat: Add real-time workload status updates

Implement WebSocket connection to Run:AI API for live status updates.
Workloads now refresh automatically when status changes.

fix: Prevent duplicate workload submissions

Add debouncing to submit buttons to prevent accidental
duplicate submissions when user clicks multiple times.
```

### Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write code following style guidelines
   - Add tests if applicable
   - Update documentation

3. **Test Thoroughly**
   ```bash
   npm run compile
   npm run lint
   npm test
   ```

4. **Commit Your Changes**
   ```bash
   git add -A
   git commit -m "feat: Add your feature"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open Pull Request**
   - Go to GitHub and open a PR
   - Fill out the PR template
   - Link any related issues
   - Request review from maintainers

### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include tests for new functionality
- Update documentation as needed
- Ensure all tests pass
- Follow code style guidelines
- Reference related issues

## Adding New Features

### Adding a New Command

1. Define command in `package.json`:
   ```json
   {
     "command": "run-ai.myCommand",
     "title": "Run:AI: My Command"
   }
   ```

2. Register command in `src/extension.ts`:
   ```typescript
   context.subscriptions.push(
     vscode.commands.registerCommand('run-ai.myCommand', async () => {
       // Implementation
     })
   );
   ```

3. Add tests in `src/test/extension.test.ts`
4. Update README.md with command documentation

### Adding a New Tree View

1. Create provider file in `src/providers/`
2. Implement `TreeDataProvider` interface
3. Register provider in `src/extension.ts`
4. Add view configuration in `package.json`
5. Add icons and styling as needed

### Adding API Endpoints

1. Add interface types in `src/api/client.ts`
2. Implement method in `RunAIClient` class
3. Add error handling
4. Update API documentation

## Documentation

### Code Comments

Add comments for:
- Complex algorithms
- Non-obvious implementations
- Public APIs
- Configuration options

### README Updates

Update README.md when:
- Adding new features
- Changing configuration
- Updating dependencies
- Modifying commands

### Architecture Docs

Update `docs/architecture.md` for:
- Structural changes
- New components
- Data flow modifications

## Testing

### Unit Tests

Write unit tests for:
- API client methods
- Provider logic
- Command handlers
- Utility functions

Example:
```typescript
import * as assert from 'assert';
import { RunAIClient } from '../api/client';

suite('RunAI Client Tests', () => {
  test('getWorkloads returns array', async () => {
    const client = new RunAIClient({ apiUrl: 'test' });
    // Test implementation
  });
});
```

### Integration Tests

Test full user workflows:
- Submitting workloads
- Viewing details
- Deleting workloads
- Configuration flow

### Manual Testing

Before submitting PR:
1. Test in Extension Development Host
2. Verify all commands work
3. Check error scenarios
4. Test with different configurations

## Release Process

Maintainers will:
1. Review and merge PRs
2. Update version in `package.json`
3. Update `CHANGELOG.md`
4. Create git tag
5. Build and publish extension

## Getting Help

- Open an issue for bugs or feature requests
- Contact maintainers for questions

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on the code, not the person

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes
- Project documentation

Thank you for contributing to Run:AI VSCode Extension!
