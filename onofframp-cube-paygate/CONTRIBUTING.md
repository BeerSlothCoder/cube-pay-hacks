# Contributing to CubePay Exchange

Thank you for your interest in contributing to CubePay Exchange! This document provides guidelines and information for contributors.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/[your-username]/cubepay-exchange.git
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🎯 Development Guidelines

### Code Style

- Use **TypeScript** for all new code
- Follow **React best practices** and hooks patterns
- Use **Tailwind CSS** for styling with CubePay brand colors
- Maintain **responsive design** principles
- Write **clean, readable code** with proper comments

### Component Structure

```tsx
// Good component structure
import { useState } from "react";
import { SomeIcon } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface ComponentProps {
  title: string;
  onAction: () => void;
}

export default function Component({ title, onAction }: ComponentProps) {
  const [state, setState] = useState(false);

  return (
    <Card>
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </Card>
  );
}
```

### Styling Guidelines

- Use **CubePay brand colors**:
  - `cube-green` (#00FF88) for primary accents
  - `cube-glow` (#00CC66) for hover states
  - `dark-bg` (#0A0F1C) for backgrounds
  - `dark-card` (#1A1F2E) for card backgrounds
- Maintain **dark theme** consistency
- Use **responsive design** classes
- Follow **accessibility** best practices

### State Management

- Use **Zustand** for global state
- Keep **local state** in components when appropriate
- Follow **immutable update** patterns

## 🐛 Bug Reports

When reporting bugs, please include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Browser and OS information**
- **Screenshots** if applicable

## ✨ Feature Requests

For new features:

- **Describe the feature** and its benefits
- **Explain the use case** and user story
- **Consider the impact** on existing functionality
- **Provide mockups** or designs if applicable

## 🔧 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**:
   ```bash
   npm run lint
   npm run build
   ```
4. **Update the README** if needed
5. **Create a pull request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots of UI changes

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] Cross-browser testing done

## Screenshots

(If applicable)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🎨 Design System

### Colors

```css
/* CubePay Brand Colors */
--cube-green: #00FF88
--cube-glow: #00CC66
--primary: #0099FF
--dark-bg: #0A0F1C
--dark-card: #1A1F2E
```

### Typography

- **Headings**: Inter font, bold weights
- **Body text**: Inter font, regular weight
- **Code/Numbers**: Monospace font

### Components

- Use existing UI components from `src/components/ui/`
- Follow established patterns for new components
- Maintain consistency with CubePay branding

## 📝 Commit Messages

Use conventional commit format:

```
type(scope): description

feat(wallet): add send cryptocurrency functionality
fix(buy): resolve price calculation bug
docs(readme): update installation instructions
style(ui): improve button hover states
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting/styling
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

## 🧪 Testing

- Write **unit tests** for utilities and hooks
- Add **integration tests** for complex flows
- Test **responsive design** on multiple devices
- Verify **accessibility** compliance
- Test **cross-browser** compatibility

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Thirdweb Docs](https://portal.thirdweb.com/)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Community

- Be **respectful** and **inclusive**
- Help **newcomers** get started
- Share **knowledge** and **best practices**
- Follow the **code of conduct**

## 📞 Questions?

If you have questions:

- Check existing **issues** and **discussions**
- Create a **new issue** for bugs
- Start a **discussion** for questions
- Reach out to maintainers

Thank you for contributing to CubePay Exchange! 🚀
