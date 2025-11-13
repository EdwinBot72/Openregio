# OpenRegio Design Guidelines

## Design Approach

**Hybrid System:** Combining Linear's professional clarity with Notion's collaborative warmth, adapted for a Dutch cooperative movement aesthetic.

**Core Philosophy:**
- **Trustworthy Professionalism:** Entrepreneurs need to trust this platform for their business
- **Accessible Power:** Complex features made simple and inviting
- **Community First:** Visual language that emphasizes collaboration over competition
- **Anti-Big-Tech Identity:** Distinctive, independent design that doesn't mimic corporate platforms

## Typography

**Font System (Google Fonts):**
- **Primary:** Inter (400, 500, 600, 700) - Clean, professional, excellent readability
- **Accent:** Space Grotesk (600, 700) - For headers and emphasis, adds character

**Hierarchy:**
- Hero/H1: Space Grotesk 700, 3xl-4xl (bold, movement-oriented messaging)
- H2: Space Grotesk 600, 2xl-3xl
- H3: Inter 600, xl-2xl
- Body: Inter 400, base-lg
- Small/Meta: Inter 400, sm
- Buttons: Inter 600, base

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12, 16, 20, 24** for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-24
- Grid gaps: gap-4 to gap-8
- Container: max-w-7xl with px-4 md:px-8

**Grid Structure:**
- Dashboard layouts: 12-column grid with sidebar
- Profile cards: 3-column on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Content areas: Generous whitespace, max-w-4xl for reading comfort

## Component Library

### Navigation
- **Top Nav:** Sticky header with logo, main navigation, user menu, prominent "RegioBot" AI access button
- **Sidebar (Dashboard):** Collapsible left sidebar with icon + label navigation for: Dashboard, Profiel, Netwerk, RegioBot, Coöperatie

### Core Components

**Business Profile Cards:**
- Image thumbnail (square, rounded-lg)
- Business name (Inter 600, lg)
- Category badge
- Location with map pin icon
- Brief description (2 lines, truncated)
- Action buttons (Bekijk Profiel, Contact)

**RegioBot Chat Interface:**
- Clean chat bubbles with subtle shadows
- User messages: align right
- Bot messages: align left with avatar
- Suggested prompts as pill buttons below input
- Floating input bar at bottom with send button

**Network/Discovery Grid:**
- Filterable entrepreneur cards
- Map view toggle option
- Category filters as chip buttons
- Distance/location sorting

**Cooperative Dashboard:**
- Stats cards with icons (Heroicons)
- Voting/decision widgets
- Contribution transparency panels
- Community announcements

### Forms & Inputs
- Rounded-lg borders
- Clear labels above inputs
- Helper text below when needed
- Focus states with subtle ring
- Button states: distinct hover/active

### Buttons
**Primary:** Rounded-full, bold CTA for main actions
**Secondary:** Rounded-full, outline style
**Tertiary:** Text-only with icon
**Icon Buttons:** Rounded-lg for tools/actions

## Icons
**Library:** Heroicons (outline for navigation, solid for emphasis)
- Consistent 20-24px sizing
- Used sparingly for clarity

## Images

**Hero Section:**
Large hero image showing local entrepreneurs collaborating in a real Dutch setting (market, street, workshop). Overlay with mission statement text and primary CTA buttons.

**Profile Photos:**
- Business logos/photos: Square format, 200x200px minimum
- Personal avatars: Circular, 40-80px
- Placeholder images use business category iconography

**Dashboard Illustrations:**
- Simple, flat illustrations for empty states
- Warm, inviting imagery emphasizing community and local economy
- Dutch cultural references where appropriate (bicycles, canals, local architecture)

**Photography Style:**
Authentic, unpolished photos of real local businesses - avoid stock photo aesthetic. Emphasis on human connection and local character.

## Special Features

**RegioBot Personality:**
- Friendly, professional Dutch tone
- Orange accent elements (cooperative movement color)
- Clear AI attribution
- Helpful, not intrusive

**Cooperative Elements:**
- Transparency badges
- Member contribution indicators
- Democratic voting interfaces
- Community achievement highlights

**Anti-Big-Tech Messaging:**
- "Platform-vrij" badges
- Data ownership indicators
- No algorithm manipulation messaging
- Clear cooperative governance visibility

## Animations
Minimal, purposeful animations:
- Smooth page transitions (200ms)
- Loading states for AI responses
- Card hover lifts (subtle)
- No decorative animations