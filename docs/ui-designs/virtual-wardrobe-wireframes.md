# Virtual Wardrobe Wireframes
**Task 3.1 - Visual Interface Mockups**

## Screen Wireframes (ASCII Art Representations)

### 1. Main Wardrobe Gallery Screen

```
┌────────────────────────────────────────┐
│ ◀ My Wardrobe        🔍 ⋮ ☰           │  Header
├────────────────────────────────────────┤
│ All | Tops | Bottoms | Dresses | ...  │  Category Tabs
├────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐               │
│ │     │ │     │ │     │               │  Grid Row 1
│ │ 👕  │ │ 👖  │ │ 👗  │               │
│ └─────┘ └─────┘ └─────┘               │
│                                        │
│ ┌─────┐ ┌─────┐ ┌─────┐               │
│ │     │ │     │ │     │               │  Grid Row 2
│ │ 🧥  │ │ 👠  │ │ 👜  │               │
│ └─────┘ └─────┘ └─────┘               │
│                                        │
│         ... more items ...             │
│                                        │
│                               ┌─────┐  │
│                               │  +  │  │  FAB
│                               └─────┘  │
└────────────────────────────────────────┘
```

### 2. Upload Source Selection Modal

```
┌────────────────────────────────────────┐
│                                        │
│           ┌─────────────────┐          │
│           │                 │          │
│           │  📷 Take Photo  │          │  Modal Options
│           │                 │          │
│           ├─────────────────┤          │
│           │                 │          │
│           │ 🖼️ Choose from    │          │
│           │   Library       │          │
│           │                 │          │
│           ├─────────────────┤          │
│           │     Cancel      │          │
│           └─────────────────┘          │
│                                        │
└────────────────────────────────────────┘
```

### 3. AI Processing Screen

```
┌────────────────────────────────────────┐
│                                        │
│          Processing Your Item          │  Title
│                                        │
│              ┌─────────┐               │
│              │  📸     │               │  User's Photo
│              │ [Photo] │               │  (Blurred)
│              └─────────┘               │
│                                        │
│               ◐ 75%                    │  Progress Circle
│                                        │
│        "Analyzing item type..."        │  Status Message
│                                        │
│             [Cancel Upload]            │  Cancel Option
│                                        │
└────────────────────────────────────────┘
```

### 4. Review & Refine Screen

```
┌────────────────────────────────────────┐
│ ✖                              ⚙️      │  Header
├────────────────────────────────────────┤
│              ┌─────────┐               │
│              │         │               │  Clean Item
│              │   👕    │               │  Image Preview
│              │ (Clean) │               │
│              └─────────┘               │
├────────────────────────────────────────┤
│ Category: [T-Shirt ▼]                  │  Editable Fields
│                                        │
│ Colors: 🔵Blue ⚪White [+ Add]         │  Color Chips
│                                        │
│ Style: [Casual] [Graphic] [+ Add]      │  Style Tags
│                                        │
│ Name: "Blue Graphic Tee" (optional)    │  Optional Name
├────────────────────────────────────────┤
│ [📸 Retake]    [✅ Save to Wardrobe]   │  Action Buttons
└────────────────────────────────────────┘
```

### 5. Advanced Filter Panel

```
┌────────────────────────────────────────┐
│ Filters                           ✖    │  Panel Header
├────────────────────────────────────────┤
│ COLORS                                 │
│ ⚫⚪🔴🔵🟢🟡🟠🟣🔴🤎          │  Color Grid
│                                        │
│ STYLE                                  │
│ ☑️ Casual    ☑️ Formal                 │  Checkboxes
│ ☐ Sporty     ☐ Vintage                │
│                                        │
│ SEASON                                 │
│ ○ Spring  ● Summer  ○ Fall  ○ Winter   │  Radio Buttons
│                                        │
│ FAVORITES                              │
│ Show favorites only: [Toggle: ON]      │  Toggle Switch
├────────────────────────────────────────┤
│ [Clear All]           [Apply Filters]  │  Actions
└────────────────────────────────────────┘
```

### 6. Item Detail Modal

```
┌────────────────────────────────────────┐
│ ✖                     ♡ ✏️ 🗑️          │  Header Actions
├────────────────────────────────────────┤
│                                        │
│              ┌─────────┐               │  Large Image
│              │         │               │  (Zoomable)
│              │   👕    │               │
│              │         │               │
│              └─────────┘               │
│                                        │
├────────────────────────────────────────┤
│ Blue Graphic T-Shirt                   │  Item Name
│ Category: Tops • Size: M               │  Basic Info
│                                        │
│ Colors: 🔵 ⚪                          │  Color Indicators
│ Style: Casual, Graphic                 │  Style Tags
│                                        │
│ Added: Aug 15, 2025                    │  Metadata
│ Worn: 3 times • Last: 2 days ago       │
├────────────────────────────────────────┤
│          [👤 Try it On Avatar]         │  Primary Action
│                                        │
│ [✏️ Edit] [🗑️ Delete] [📤 Share]       │  Secondary Actions
└────────────────────────────────────────┘
```

## Responsive Design Breakpoints

### Mobile (320px - 768px)
- 2-column grid layout
- Stacked navigation elements
- Full-screen modals
- Touch-optimized controls

### Tablet (768px - 1024px)
- 3-4 column grid layout
- Side panel for filters
- Larger touch targets
- Enhanced metadata display

### Desktop (1024px+)
- 4-6 column grid layout
- Sidebar navigation
- Hover states and interactions
- Keyboard shortcuts

## Component Interaction Flow

### Upload Flow State Machine
```
IDLE → SELECTING_SOURCE → CAPTURING/SELECTING → PROCESSING → REVIEWING → SAVING → COMPLETE
  ↑                                                                                    ↓
  └────────────────────────── CANCEL/ERROR ←─────────────────────────────────────────┘
```

### Gallery Filter State
```
DEFAULT_VIEW → FILTER_OPENED → FILTER_APPLIED → RESULTS_DISPLAYED
     ↑                                                    ↓
     └─────────────── CLEAR_FILTERS ←──────────────────────┘
```

## Animation Specifications

### Page Transitions
- **Duration**: 300ms
- **Easing**: cubic-bezier(0.25, 0.46, 0.45, 0.94)
- **Type**: Slide left/right for navigation

### Modal Animations
- **Entry**: Fade in (opacity 0→1) + Scale up (0.95→1)
- **Exit**: Fade out + Scale down
- **Duration**: 200ms
- **Backdrop**: Fade in/out 150ms

### Micro-interactions
- **Button Press**: Scale down to 0.95, duration 100ms
- **Item Selection**: Border animation + scale 1→1.05→1
- **Loading States**: Skeleton shimmer animation
- **Success Feedback**: Bounce animation + color change

## Theme Implementation Guidelines

### Design Token Structure
```typescript
interface ThemeTokens {
  primary: string     // Main brand color
  secondary: string   // Secondary actions
  background: string  // Main background
  surface: string     // Card/modal backgrounds
  border: string      // Dividers and borders
  text: {
    primary: string   // Main text
    secondary: string // Supporting text
    disabled: string  // Inactive text
  }
  radius: {
    small: string     // Buttons, tags
    medium: string    // Cards, inputs
    large: string     // Modals, images
  }
  shadow: {
    small: string     // Subtle elevation
    medium: string    // Cards, FAB
    large: string     // Modals, overlays
  }
}
```

### Theme Variations

#### Bubbly Theme Colors
```css
--primary: #FF69B4;
--secondary: #DA70D6;
--background: #FFF5F8;
--surface: #FFFFFF;
--border: #FFB6C1;
--text-primary: #2D1B69;
--text-secondary: #8B5A8C;
```

#### Bro Theme Colors
```css
--primary: #2C3E50;
--secondary: #34495E;
--background: #ECF0F1;
--surface: #FFFFFF;
--border: #BDC3C7;
--text-primary: #2C3E50;
--text-secondary: #7F8C8D;
```

#### Professional Theme Colors
```css
--primary: #1E3A8A;
--secondary: #3B82F6;
--background: #F8FAFC;
--surface: #FFFFFF;
--border: #E2E8F0;
--text-primary: #1E293B;
--text-secondary: #64748B;
```

---

*These wireframes provide the visual foundation for implementing the Virtual Wardrobe UI, ensuring consistency with the existing codebase and supporting future feature integration.*
