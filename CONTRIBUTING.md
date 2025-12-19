# Contributing to ARPO Studio

Thank you for your interest in contributing to ARPO Studio! 🎉

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Development Setup

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/final-auction1.git
   cd final-auction1
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp env.example.md .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use strict typing, avoid `any`
- **React**: Use functional components with hooks
- **Naming**: Use camelCase for functions, PascalCase for components
- **Files**: Use kebab-case for file names

### Component Structure

```tsx
"use client"

import { useState, useEffect } from "react"
// External imports first, then internal

interface MyComponentProps {
  // Props with JSDoc comments
  /** Description of prop */
  propName: string
}

/**
 * Brief component description
 */
export default function MyComponent({ propName }: MyComponentProps) {
  // Hooks first
  const [state, setState] = useState()
  
  // Effects
  useEffect(() => {
    // ...
  }, [])
  
  // Handlers
  const handleClick = () => {
    // ...
  }
  
  // Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

### Commit Messages

Use conventional commits:

```
feat: add new bidding animation
fix: resolve chat scroll issue
docs: update README with deployment steps
refactor: extract ModalWrapper component
test: add AuctionHouse settlement tests
chore: update dependencies
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/AuctionHouse.test.ts

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## 📁 Project Structure

```
├── app/                 # Next.js pages
├── components/          # React components
│   ├── admin/          # Admin panel components
│   ├── ui/             # Reusable UI components
│   └── *.tsx           # Feature components
├── contracts/          # Solidity contracts
├── hooks/              # Custom hooks
├── lib/                # Utilities
├── test/               # Contract tests
└── scripts/            # Deployment scripts
```

---

## 🧩 Component Patterns

### Extracted Tab Components

When extracting tab content from large files like `admin-panel.tsx`:

```tsx
// Parent owns state, child receives via props
interface MyTabProps {
  isDark: boolean
  data: ItemType[]
  onAction: (id: string) => void
}

export default function MyTab({ isDark, data, onAction }: MyTabProps) {
  // Display only - no internal state that affects parent
  return (
    <div>
      {data.map(item => (
        <Button onClick={() => onAction(item.id)}>Action</Button>
      ))}
    </div>
  )
}
```

See: `components/admin/admin-users-tab.tsx`, `admin-chat-tab.tsx`

### Memoization Guidelines

Use `memo` for list item components that re-render frequently:

```tsx
import { memo } from "react"

const ChatMessageItem = memo(function ChatMessageItem({ message, isDark }: Props) {
  // Component content
})
```

Use `useCallback` for handlers passed to child components:

```tsx
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies])
```

See: `components/auction-chat.tsx` for ChatMessageItem example

## 🔄 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests if applicable
   - Update documentation

3. **Test your changes**
   ```bash
   npm run build
   npx tsc --noEmit
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**
   - Describe what your PR does
   - Reference any related issues
   - Add screenshots if UI changes

---

## 🐛 Bug Reports

Please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/environment info
- Screenshots if relevant

---

## 💡 Feature Requests

We welcome feature suggestions! Please:
- Check existing issues first
- Describe the use case
- Explain proposed solution

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make ARPO Studio better! 🙏
