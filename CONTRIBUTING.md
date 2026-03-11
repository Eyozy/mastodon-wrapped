# Contributing to Mastodon Wrapped

Thanks for your interest in contributing to Mastodon Wrapped!

## Development Environment

### Prerequisites

- Node.js 18+
- npm

### Local Development

```bash
# Clone the repository
git clone https://github.com/Eyozy/mastodon-wrapped.git
cd mastodon-wrapped

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Code Standards

### Formatting

The project uses Prettier for consistent code style:

```bash
# Check formatting (does not modify files)
npm run format -- --check

# Auto-format all files
npm run format
```

### Lint

The project uses ESLint for code quality:

```bash
npm run lint
```

### Tests

The project uses Vitest for unit testing:

```bash
# Run tests (watch mode)
npm test

# Run tests (single run)
npm run test:run
```

### Test Guidelines

Please write unit tests for new features:

- Test files go in the `test/` directory
- Naming convention: `*.test.js` or `*.test.jsx`
- Test utilities: `test/dataAnalyzer.test.js`
- Test components: `test/components/*.test.jsx`

```javascript
import { describe, it, expect } from 'vitest';

describe('functionName', () => {
  it('should do something specific', () => {
    expect(actual).toBe(expected);
  });
});
```

### Build

```bash
npm run build
```

## Commit Standards

### Commit Message Format

Use Conventional Commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation update
- `style`: Code formatting (no functional change)
- `refactor`: Code refactoring
- `test`: Test related
- `chore`: Build tool or auxiliary tool changes

**Examples**:

```
feat(stats): add hourly distribution chart

fix(api): handle rate limit error properly

docs(readme): update installation instructions
```

## Pull Request Process

1. Fork the project
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run checks to ensure everything passes:
   ```bash
   npm run format      # Format code
   npm run lint       # Check code quality
   npm run test:run  # Run tests
   npm run build     # Build project
   ```
5. Commit and push to your fork
6. Create a Pull Request
7. Wait for code review

## Reporting Issues

If you find a bug or have a feature request, please open a GitHub Issue.

## License

Contributed code will be licensed under the MIT License.
