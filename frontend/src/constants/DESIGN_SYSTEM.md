# GamifyX Design System

## Overview

The GamifyX design system implements a modern cyberpunk aesthetic with dark and light mode support. It features neon glow effects, glass morphism, smooth transitions, and a carefully curated typography system.

## Color Palette

### Dark Mode (Default)
- **Primary (Cyan)**: `#00FFFF` - Main interactive elements
- **Secondary (Magenta)**: `#FF00FF` - Accent and highlights
- **Accent (Blue)**: `#0099FF` - Alternative interactive elements
- **Background**: `#0a0e27` - Main background
- **Surface**: `#1a1a3e` - Card and container backgrounds
- **Text**: `#ffffff` - Primary text
- **Text Secondary**: `#cbd5e1` - Secondary text
- **Success**: `#10b981` - Success states
- **Warning**: `#f59e0b` - Warning states
- **Error**: `#ef4444` - Error states

### Light Mode
- **Primary (Blue)**: `#0099FF` - Main interactive elements
- **Secondary (Magenta)**: `#FF00FF` - Accent and highlights
- **Accent (Cyan)**: `#00FFFF` - Alternative interactive elements
- **Background**: `#f8fafc` - Main background
- **Surface**: `#f1f5f9` - Card and container backgrounds
- **Text**: `#0f172a` - Primary text
- **Text Secondary**: `#475569` - Secondary text

## Typography

### Font Families
- **Headings**: Orbitron (400, 700, 900 weights)
- **Body**: Inter (300, 400, 500, 600, 700 weights)
- **Code**: Space Mono (400, 700 weights)

### Font Sizes
- **Heading XL**: 2.25rem (36px) - Page titles
- **Heading LG**: 1.875rem (30px) - Section titles
- **Heading MD**: 1.5rem (24px) - Subsection titles
- **Heading SM**: 1.25rem (20px) - Card titles
- **Body LG**: 1.125rem (18px) - Large body text
- **Body MD**: 1rem (16px) - Standard body text
- **Body SM**: 0.875rem (14px) - Small body text
- **Code**: 0.875rem (14px) - Code blocks

## Effects

### Glass Morphism
Glass morphism creates a frosted glass effect with semi-transparency and backdrop blur.

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

**Usage**: Cards, modals, overlays, navigation elements

### Neon Glow
Neon glow effects create a cyberpunk aesthetic with glowing shadows.

```css
.glow-cyan {
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.glow-cyan:hover {
  box-shadow: 0 0 40px rgba(0, 255, 255, 0.6);
}
```

**Colors**:
- Cyan: `rgba(0, 255, 255, 0.5)`
- Magenta: `rgba(255, 0, 255, 0.5)`
- Blue: `rgba(0, 153, 255, 0.5)`

**Usage**: Interactive elements, buttons, active states, hover effects

### Gradients
Gradient backgrounds create depth and visual interest.

```css
.gradient-dark {
  background: linear-gradient(to bottom right, #0a0e27, #1a1a3e);
}

.gradient-neon {
  background: linear-gradient(to right, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2));
}
```

## Transitions

All transitions use smooth easing functions for a polished feel.

- **Fast**: 150ms - Quick feedback (hover, focus)
- **Normal**: 300ms - Standard transitions (page changes, animations)
- **Slow**: 500ms - Entrance animations, complex transitions

```css
.transition-fast {
  transition: all 150ms ease-out;
}

.transition-normal {
  transition: all 300ms ease-out;
}

.transition-slow {
  transition: all 500ms ease-out;
}
```

## Components

### Buttons

#### Primary Button
```tsx
<button className="btn-primary">
  Click me
</button>
```
- Background: Cyan (#00FFFF)
- Text: Black
- Hover: Darker cyan
- Focus: Ring with cyan glow

#### Secondary Button
```tsx
<button className="btn-secondary">
  Click me
</button>
```
- Background: Magenta (#FF00FF)
- Text: White
- Hover: Darker magenta
- Focus: Ring with magenta glow

#### Ghost Button
```tsx
<button className="btn-ghost">
  Click me
</button>
```
- Background: Transparent
- Border: Cyan
- Text: Cyan
- Hover: Cyan background with low opacity

### Cards

```tsx
<div className="card card-dark">
  <h3 className="heading-md">Card Title</h3>
  <p className="body-md">Card content goes here</p>
</div>
```

- Background: Semi-transparent slate (dark mode) or white (light mode)
- Border: Cyan with low opacity
- Hover: Border becomes more opaque
- Backdrop blur: 10px

### Glass Morphism Elements

```tsx
<div className="glass">
  <p className="body-md">Glass morphism content</p>
</div>
```

- Background: White with 10% opacity (dark mode)
- Backdrop blur: 10px
- Border: White with 20% opacity

## Animations

### Entrance Animations
- **Fade In**: 300ms, opacity 0 → 1
- **Slide In**: 500ms, translateX -100% → 0
- **Scale In**: 300ms, scale 0.95 → 1

### Hover Animations
- **Scale**: 1 → 1.05
- **Glow Pulse**: Opacity oscillates between 1 and 0.8
- **Color Shift**: Border and shadow colors intensify

### Staggered Animations
Multiple elements animate with 100ms delay between each:
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    {item.content}
  </motion.div>
))}
```

## Responsive Design

### Breakpoints
- **Mobile**: ≤ 320px - Single column, touch-friendly
- **Tablet**: 768px - Two columns, optimized spacing
- **Desktop**: 1024px - Multi-column, full features
- **Wide**: 1920px+ - Maximum width containers

### Mobile-First Approach
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* Responsive grid */}
</div>
```

## Accessibility

### Focus States
All interactive elements have visible focus indicators:
```css
.focus-ring {
  outline: none;
  ring: 2px;
  ring-color: #00FFFF;
  ring-offset: 2px;
  ring-offset-color: #0a0e27;
}
```

### Keyboard Navigation
- Tab: Navigate through interactive elements
- Enter/Space: Activate buttons
- Escape: Close modals and dropdowns
- Arrow keys: Navigate lists and menus

### Screen Reader Support
- ARIA labels on all interactive elements
- Semantic HTML (button, nav, main, etc.)
- Skip links for keyboard navigation
- Descriptive alt text for images

### Motion Preferences
Respects `prefers-reduced-motion` media query:
```tsx
const prefersReducedMotion = useReducedMotion()

<motion.div
  animate={prefersReducedMotion ? {} : { scale: 1.05 }}
>
  Content
</motion.div>
```

## Dark/Light Mode Toggle

The theme can be toggled using the `useTheme` hook:

```tsx
import { useTheme } from '../contexts/ThemeContext'

export const MyComponent = () => {
  const { mode, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme}>
      Current mode: {mode}
    </button>
  )
}
```

Theme preference is persisted to localStorage and respects system preferences.

## Usage Examples

### Creating a Styled Card
```tsx
<div className="card card-dark p-6">
  <h3 className="heading-md text-cyan-400 mb-4">Title</h3>
  <p className="body-md text-gray-300 mb-4">Description</p>
  <button className="btn-primary">Action</button>
</div>
```

### Creating a Glowing Button
```tsx
<button className="btn-primary glow-cyan">
  Click me
</button>
```

### Creating a Glass Morphism Panel
```tsx
<div className="glass p-6 rounded-lg">
  <h2 className="heading-lg text-white mb-4">Panel Title</h2>
  <p className="body-md text-gray-300">Content</p>
</div>
```

### Staggered Animation
```tsx
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

## Best Practices

1. **Use semantic HTML**: Use `<button>`, `<nav>`, `<main>`, etc.
2. **Maintain contrast**: Ensure text is readable on all backgrounds
3. **Respect motion preferences**: Always check `prefers-reduced-motion`
4. **Use consistent spacing**: Follow the 4px grid system
5. **Test accessibility**: Use keyboard navigation and screen readers
6. **Optimize performance**: Use CSS classes instead of inline styles
7. **Keep animations subtle**: Avoid excessive motion that distracts
8. **Test both themes**: Ensure components work in dark and light modes
