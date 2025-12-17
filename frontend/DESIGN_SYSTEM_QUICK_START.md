# Design System Quick Start Guide

## Using the Theme System

### 1. Access Current Theme
```tsx
import { useTheme } from '../contexts/ThemeContext'

export const MyComponent = () => {
  const { mode, toggleTheme } = useTheme()
  
  return (
    <div>
      <p>Current mode: {mode}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}
```

### 2. Apply Design System Classes

#### Cards
```tsx
<div className="card card-dark p-6">
  <h3 className="heading-md text-cyan-400">Title</h3>
  <p className="body-md text-gray-300">Content</p>
</div>
```

#### Buttons
```tsx
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-ghost">Ghost</button>
```

#### Glass Morphism
```tsx
<div className="glass p-6 rounded-lg">
  <p className="body-md">Glass effect content</p>
</div>
```

#### Neon Glow
```tsx
<div className="glow-cyan p-6 rounded-lg bg-slate-800">
  Glowing element
</div>
```

### 3. Typography
```tsx
<h1 className="heading-xl">Extra Large Heading</h1>
<h2 className="heading-lg">Large Heading</h2>
<h3 className="heading-md">Medium Heading</h3>
<p className="body-md">Body text</p>
<code className="code-text">Code snippet</code>
```

### 4. Transitions
```tsx
<div className="transition-fast hover:scale-105">
  Fast transition on hover
</div>

<div className="transition-normal hover:bg-cyan-500/20">
  Normal transition
</div>

<div className="transition-slow">
  Slow transition
</div>
```

### 5. Responsive Design
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* Responsive grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
</div>
```

## Color Usage

### Dark Mode (Default)
```tsx
// Primary interactive elements
className="text-cyan-400 bg-cyan-500 border-cyan-500"

// Secondary accents
className="text-magenta-400 bg-magenta-500"

// Backgrounds
className="bg-slate-900 bg-slate-800"
```

### Light Mode
```tsx
// Primary interactive elements
className="text-blue-600 bg-blue-500"

// Secondary accents
className="text-magenta-500 bg-magenta-500"

// Backgrounds
className="bg-white bg-gray-50"
```

## Common Patterns

### Animated Card with Stagger
```tsx
import { motion } from 'framer-motion'

{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    className="card card-dark"
  >
    {item.content}
  </motion.div>
))}
```

### Interactive Button with Glow
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="btn-primary glow-cyan"
>
  Click me
</motion.button>
```

### Glass Panel
```tsx
<div className="glass p-6 rounded-lg backdrop-blur-glass">
  <h3 className="heading-md text-white mb-4">Panel Title</h3>
  <p className="body-md text-gray-300">Content</p>
</div>
```

### Responsive Navigation
```tsx
<nav className="hidden md:flex gap-4">
  {/* Desktop navigation */}
</nav>

<button className="md:hidden">
  {/* Mobile menu toggle */}
</button>
```

## Accessibility Checklist

- ✅ Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- ✅ Add ARIA labels to interactive elements
- ✅ Ensure focus rings are visible
- ✅ Support keyboard navigation (Tab, Enter, Escape)
- ✅ Test with screen readers
- ✅ Maintain color contrast (WCAG AA)
- ✅ Respect `prefers-reduced-motion`

## Testing

### Run Design System Tests
```bash
npm run test:run -- src/contexts/ThemeContext.test.tsx
npm run test:run -- src/components/Navigation/ThemeToggle.test.tsx
```

### Test Theme Toggle
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../contexts/ThemeContext'

test('theme toggle works', () => {
  render(
    <ThemeProvider>
      <YourComponent />
    </ThemeProvider>
  )
  
  const button = screen.getByRole('button')
  fireEvent.click(button)
  // Assert theme changed
})
```

## Performance Tips

1. **Use CSS classes** instead of inline styles
2. **Leverage Tailwind** for responsive design
3. **Minimize animations** on low-end devices
4. **Use `prefers-reduced-motion`** for accessibility
5. **Lazy load** heavy components
6. **Optimize images** for different screen sizes

## Troubleshooting

### Theme not persisting
- Check localStorage is enabled
- Verify ThemeProvider wraps the app
- Check browser console for errors

### Styles not applying
- Ensure Tailwind CSS is imported
- Check class names are correct
- Verify dark/light mode classes on HTML element

### Animations not smooth
- Check `prefers-reduced-motion` setting
- Verify framer-motion is installed
- Check browser performance

## Resources

- [Design System Documentation](./src/constants/DESIGN_SYSTEM.md)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Framer Motion Docs](https://www.framer.com/motion)
- [Lucide Icons](https://lucide.dev)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
