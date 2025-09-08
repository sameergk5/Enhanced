# Virtual Wardrobe UI/UX Design Specification

**Task 3.1 Implementation - September 7, 2025**

## Overview

This document outlines the comprehensive UI/UX design for the Virtual Wardrobe and Upload Flow, integrating with the existing React/TypeScript codebase and theming system.

## Design Principles

### 1. Frictionless Upload Experience

- Leverage AI as the "magic" feature for automatic processing
- Minimize user effort while maintaining accuracy through "review & refine" pattern

- Celebrate the AI processing with engaging feedback

### 2. Action-Oriented Gallery

- Optimize for quick browsing, filtering, and outfit creation

- Seamless integration with avatar try-on system (Task 4)
- Scalable layout that works across all themes (Task 7)

### 3. Theme-Agnostic Design System

- Consistent layout and UX across Bubbly, Bro, and Professional themes
- Use design tokens for colors, typography, and spacing

- Future-proof for monetization features (Task 10)

## User Flow Diagrams

### Primary Upload Flow

```
1. Main Wardrobe Screen
   ↓ [FAB: + Camera Icon]
2. Image Source Selection Modal
   ├── Take Photo → Device Camera
   └── Choose from Library → Photo Gallery
   ↓
3. AI Processing Screen
   ├── Background removal animation
   ├── Item type detection
   ├── Color analysis
   └── Style tagging
   ↓

4. Review & Refine Screen
   ├── Clean item image preview
   ├── Editable AI-detected metadata
   └── Save to Wardrobe button
   ↓
5. Confirmation & Next Action

   ├── Success animation
   ├── "Style it now?" dialog
   └── Return to wardrobe gallery
```

### Gallery Navigation Flow

```
1. Wardrobe Gallery
   ├── Category tabs (All, Tops, Bottoms, etc.)
   ├── Filter button → Advanced filters
   ├── Grid/List view toggle

   └── Item cards
   ↓ [Tap item]
2. Item Detail Modal
   ├── Full-size image
   ├── Metadata display
   ├── Edit/Delete actions

   └── "Try it on" → Avatar screen

```

## Screen Specifications

### 1. Main Wardrobe Gallery

#### Layout Structure

- **Header**: Title "My Wardrobe" + Filter button + View toggle
- **Category Tabs**: Scrollable horizontal tabs
- **Main Content**: 2-3 column grid layout

- **FAB**: Persistent floating action button (bottom-right)

#### Category Tabs

```
[All] [Tops] [Bottoms] [Dresses] [Outerwear] [Shoes] [Accessories]

```

#### Grid Item Design

- **Image**: Background-removed clothing photo
- **Overlay**: Favorite heart icon (top-right)
- **Selection State**: Blue border/checkmark for multi-select

- **Dimensions**: Square aspect ratio for consistency

#### Statistics Bar (Optional)

- Total items count
- Recently added indicator
- Quick action shortcuts

### 2. Upload Flow Screens

#### Image Source Selection Modal

- **Background**: Semi-transparent overlay
- **Modal**: Centered rounded card
- **Options**:

  - `📷 Take Photo` - Large button with camera icon
  - `🖼️ Choose from Library` - Large button with gallery icon
- **Footer**: Cancel button

#### AI Processing Screen

- **Hero Image**: User's uploaded photo (blurred/dimmed)
- **Progress Indicator**: Animated circular progress
- **Status Messages**: Cycling text showing AI tasks
- **Background**: Subtle animated gradient
- **Cancel Option**: Available during processing

#### Review & Refine Screen

- **Top Section**: Clean item image (large preview)
- **Middle Section**: Editable metadata cards
  - Category dropdown
  - Color chips (addable/removable)
  - Style tags (chip-based interface)
  - Optional: Name field

- **Bottom Section**:
  - "Save to Wardrobe" primary button
  - "Retake Photo" secondary button

### 3. Advanced Filter Panel

#### Filter Categories

- **Color**: Grid of color swatches
- **Style**: Checkbox list (Casual, Formal, Sporty, etc.)
- **Season**: Radio buttons (Spring, Summer, Fall, Winter)
- **Recently Worn**: Date range slider
- **Favorites**: Toggle switch

#### UI Components

- **Slide-out panel** from right side (mobile)
- **Apply/Clear actions** at bottom
- **Active filter indicators** on main screen

### 4. Item Detail Modal

#### Layout

- **Full-screen overlay** with close button

- **Image Section**: Large photo with zoom capability
- **Metadata Section**:
  - Item name and category
  - Color indicators
  - Style tags
  - Purchase date, brand (if available)
  - Wear count and last worn date
- **Action Section**:
  - "Try it On" primary button
  - Edit, Delete, Favorite buttons
  - Share button (future feature)

## Component Architecture

### React Component Structure

```
WardrobeScreen/


├── WardrobeHeader
│   ├── TitleSection
│   ├── FilterButton
│   └── ViewToggle
├── CategoryTabs
├── WardrobeGrid
│   ├── GarmentCard[]
│   └── EmptyState
├── UploadFAB
└── Modals/
    ├── ImageSourceModal
    ├── ProcessingModal
    ├── ReviewRefineModal
    ├── FilterPanel
    └── ItemDetailModal
```

### State Management

```typescript
interface WardrobeState {
  items: Garment[]
  loading: boolean
  filters: {
    category: string
    colors: string[]
    styles: string[]
    searchTerm: string
  }
  viewMode: 'grid' | 'list'
  selectedItems: string[]
  uploadState: 'idle' | 'selecting' | 'processing' | 'reviewing'
}
```

## Design Tokens & Theming

### Core Design System

```typescript

interface DesignTokens {
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string

    text: {
      primary: string
      secondary: string
      disabled: string
    }
    border: string

    error: string
    success: string
  }
  typography: {
    heading: TextStyle
    body: TextStyle
    caption: TextStyle
    button: TextStyle


  }
  spacing: {
    xs: number // 4px
    sm: number // 8px
    md: number // 16px
    lg: number // 24px


    xl: number // 32px
  }
  borderRadius: {
    sm: number // 4px
    md: number // 8px

    lg: number // 12px

    xl: number // 16px
  }
}
```

### Theme Variations

#### Bubbly Theme

- **Primary Colors**: Pink/Purple gradients (#FF69B4, #DA70D6)
- **Typography**: Rounded, friendly fonts

- **Corner Radius**: Large, soft corners
- **Icons**: Filled, playful style

#### Bro Theme

- **Primary Colors**: Dark blues/grays (#2C3E50, #34495E)
- **Typography**: Bold, masculine fonts

- **Corner Radius**: Sharp, minimal corners
- **Icons**: Outlined, geometric style

#### Professional Theme

- **Primary Colors**: Navy/White (#1E3A8A, #F8FAFC)
- **Typography**: Clean, readable fonts
- **Corner Radius**: Moderate, business-like
- **Icons**: Outlined, professional style

## Interaction Design

### Animations & Transitions

- **Page transitions**: Slide left/right for navigation

- **Modal appearances**: Fade in with scale
- **Filter panel**: Slide from right

- **Upload success**: Celebratory micro-animation
- **Grid item selection**: Scale and border animation

### Gesture Support

- **Swipe**: Navigate between category tabs
- **Pull to refresh**: Reload wardrobe items
- **Long press**: Enter multi-select mode

- **Pinch to zoom**: In item detail view

### Haptic Feedback

- **Selection**: Light haptic on item tap

- **Success**: Medium haptic on upload complete
- **Error**: Error haptic pattern

## Accessibility Considerations

### WCAG 2.1 AA Compliance

- **Color Contrast**: Minimum 4.5:1 ratio for text
- **Touch Targets**: Minimum 44pt size
- **Screen Reader**: Proper semantic markup and labels
- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Clear visual focus states

### Inclusive Design

- **Color Blind**: Don't rely solely on color for information
- **Motor Impairments**: Large touch targets, forgiving gestures
- **Visual Impairments**: High contrast mode support

- **Cognitive Load**: Clear information hierarchy

## Integration Points

### Task 4 (Virtual Try-On)

- "Try it On" buttons in item cards and detail modal
- Quick outfit assembly from gallery
- Seamless navigation to avatar screen

### Task 7 (Theming Engine)

- All components use design tokens
- Theme switching updates entire interface
- Consistent layout across themes

### Task 5 (Social Sharing)

- Share buttons in item detail modal
- Export outfit combinations
- Privacy settings integration

## Technical Implementation Notes

### Performance Optimizations

- **Virtual scrolling** for large wardrobe collections
- **Image lazy loading** with placeholder states
- **Caching strategy** for AI-processed images
- **Debounced search** and filtering

### API Integration

- **Upload endpoint**: POST /api/wardrobe/items
- **Gallery endpoint**: GET /api/wardrobe/items?filters
- **AI processing**: Webhook-based updates
- **Metadata updates**: PATCH /api/wardrobe/items/:id

### Error Handling

- **Network failures**: Retry mechanisms with user feedback
- **Upload failures**: Clear error messages and recovery options
- **AI processing failures**: Fallback to manual input
- **Large file handling**: Compression before upload

## Next Steps (Task 3.2-3.5)

1. **Backend API Development** (Task 3.2)
2. **AI Service Integration** (Task 3.3)
3. **Frontend Implementation** (Task 3.4)
4. **AI Metadata Integration** (Task 3.5)

---

*This design specification provides the foundation for implementing a world-class virtual wardrobe experience that leverages AI processing while maintaining user control and supporting the broader Wardrobe AI platform goals.*
