# Design Guidelines: Library Book Recommendation System

## Design Approach
**System Selected**: Material Design-influenced modern web application  
**Rationale**: Content-rich application requiring clear information hierarchy, strong visual feedback for user actions, and professional presentation suitable for academic evaluation.

## Typography System
**Font Stack**:
- Primary: Inter (Google Fonts) - Headings and UI elements
- Secondary: System UI fonts for body text

**Hierarchy**:
- Page Titles: text-4xl font-bold
- Section Headers: text-2xl font-semibold
- Card Titles: text-xl font-medium
- Body Text: text-base font-normal
- Meta Info: text-sm font-normal
- Labels: text-xs font-medium uppercase tracking-wide

## Layout & Spacing System
**Container Strategy**:
- Main app container: max-w-7xl mx-auto px-4
- Card grids: gap-6 for desktop, gap-4 for mobile
- Section spacing: py-8 between major sections

**Tailwind Spacing Primitives**: Use units of 2, 4, 6, and 8
- Tight spacing: p-2, m-2
- Standard spacing: p-4, gap-4
- Section spacing: py-6, my-6
- Large spacing: p-8, mb-8

## Component Library

### BookCard Component
- Rounded corners: rounded-xl
- Padding: p-6
- Shadow: Drop shadow on card
- Hover: Subtle lift animation (translateY)
- Layout: Vertical stack with book details
- Elements: Title, Author, Genre tags, View/Recommend actions

### RecommendationCard Component  
- Similar to BookCard with added score indicator
- Includes relationship type badge
- Similarity score visualization (percentage or star rating)
- "Why recommended" micro-text explanation

### Search Interface
- Prominent search bar: Large input with search icon
- Width: w-full max-w-2xl
- Rounded: rounded-full for modern look
- Padding: py-3 px-6
- Auto-complete dropdown below search

### Navigation
- Top navigation bar with app title and primary actions
- Fixed position: sticky top-0
- Height: h-16
- Links: Add Book, Browse All, Search

### Forms (Add Book Page)
- Label above input pattern
- Input spacing: space-y-4
- Input styling: rounded-lg with defined border
- Multi-select for genres/keywords with tag chips
- Submit button: Large, rounded-lg, full-width on mobile

### Data Display
- Book grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- List views: Alternating subtle background for rows
- Empty states with icon and helpful message

### Loading States
- Skeleton cards matching BookCard dimensions
- Pulse animation on loading elements
- Loading spinner for search/recommendations

## Animations & Interactions
**Use Sparingly - Key Moments Only**:
- Page transitions: Subtle fade-in
- Card hover: Scale up slightly (scale-105), lift shadow
- Recommendation list: Stagger animation (each card animates in sequence)
- Search results: Fade and slide up
- Add book success: Checkmark animation

**No animations on**:
- Text rendering
- Static content
- Navigation clicks

## Accessibility
- Focus states clearly visible on all interactive elements
- Form inputs with proper labels and aria-labels
- Keyboard navigation support
- Sufficient contrast ratios throughout
- Alt text for any book cover images (if implemented)

## Images
**Book Covers**: Placeholder images for book covers (150x200px ratio)
- Position: Top of BookCard or left side in list view
- Fallback: Gradient placeholder with book icon if no image

**No Hero Image Required**: This is a utility application, not a marketing page. Start immediately with search interface and featured books.

## Page-Specific Layouts

**Home Page**:
- Featured search bar centered at top
- "Recently Added" books grid below
- "Popular Recommendations" section
- All books browsable in grid format

**Search/Recommendation Page**:
- Search bar at top
- Searched book displayed prominently
- "Top 5 Recommendations" heading
- Recommendation cards in vertical list with relationship indicators
- Each card shows connection strength and reason

**Add Book Page**:
- Centered form: max-w-2xl
- Clear field labels
- Genre tags as multi-select chips
- Success message with option to add another or view book