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

## Code Quality

### Formatting

The project uses Prettier for consistent code style:

```bash
# Check formatting (does not modify files)
npm run format -- --check

# Auto-format all files
npm run format
```

### Linting

The project uses ESLint for code quality:

```bash
npm run lint
```

### Testing

The project uses Vitest for unit testing:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

### Building

```bash
npm run build
```

All four commands must pass before submitting a Pull Request.

## Testing Guidelines

Write unit tests for new features:

- Test files go in the `test/` directory
- Naming convention: `*.test.js` or `*.test.jsx`
- Test utilities in `test/analyzeStatuses.test.js`

```javascript
import { describe, it, expect } from 'vitest';

describe('functionName', () => {
  it('should do something specific', () => {
    expect(actual).toBe(expected);
  });
});
```

## Commit Standards

### Commit Message Format

Use Conventional Commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation update
- `style`: Code formatting (no functional change)
- `refactor`: Code refactoring
- `test`: Test related
- `chore`: Build tool or auxiliary tool changes

**Examples:**

```
feat(stats): add hourly distribution chart
fix(api): handle rate limit error properly
docs(readme): update installation instructions
```

## Pull Request Process

1. Fork the project
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run quality checks:
   ```bash
   npm run format
   npm run lint
   npm run test:run
   npm run build
   ```
5. Commit and push to your fork
6. Create a Pull Request
7. Wait for code review

## Reporting Issues

Found a bug or have a feature request? Open a GitHub Issue.

## License

Contributed code will be licensed under the MIT License.
