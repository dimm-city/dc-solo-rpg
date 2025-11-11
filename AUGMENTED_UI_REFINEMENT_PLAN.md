# Augmented-UI Refinement Plan

## Current Analysis

### Existing Implementation
- **Player-Round-Bar**: `tl-clip-x tr-2-clip-x br-clip bl-2-clip-x`
- **Health**: `tr-clip tl-clip-x br-2-clip-x border`
- **Failure**: `tl-2-clip-y tr-clip bl-clip-x border`
- **Luck**: `tr-clip-y tl-clip br-2-clip-x border`
- **Success**: `tl-clip-x tr-2-clip bl-clip-y br-clip border`

### Issues
1. No visual coordination between adjacent elements
2. Inconsistent clipping patterns
3. No relationship between player-round-bar and stat items
4. Clips don't enhance the horizontal label/value/bar layout

## Refined Design Strategy

### Design Principles
1. **Interlocking Pattern**: Adjacent elements create visual connections
2. **Directional Flow**: Left-to-right energy/data flow
3. **Size Coordination**: Use --aug-clip-md (12px) consistently with gaps
4. **Layout Integration**: Clips enhance rather than obstruct content

### New Configuration

#### Player-Round-Bar
```
data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
--aug-tl: 14px
--aug-tr: 14px
--aug-br: 14px
--aug-bl: 14px
```
**Rationale**: Uniform corner clips create stable frame for content

#### Stat Items - Interlocking Chevron Pattern

**Health (Left Start)**
```
data-augmented-ui="tl-clip tr-clip-x br-clip-x border"
--aug-tl: 8px
--aug-tr: 14px
--aug-br: 14px
```
**Rationale**: Sharp right edge creates forward momentum

**Failure (Left Arrow)**
```
data-augmented-ui="tl-clip-y tr-clip br-clip-y border"
--aug-tl: 14px
--aug-tr: 8px
--aug-br: 14px
```
**Rationale**: Vertical clips on left, point on right - mirror pattern

**Luck (Right Arrow)**
```
data-augmented-ui="tl-clip tr-clip-y br-clip border"
--aug-tl: 8px
--aug-tr: 14px
--aug-br: 8px
```
**Rationale**: Pointed left side, creates visual rhythm

**Success (Right End)**
```
data-augmented-ui="tl-clip-x tr-clip br-clip-x bl-clip border"
--aug-tl: 14px
--aug-tr: 8px
--aug-br: 14px
--aug-bl: 8px
```
**Rationale**: Sharp left edge receives flow, stable right completes sequence

### Layout Adjustments
- Ensure labels/values have adequate padding from clipped edges
- Progress bars extend into safe zones
- Responsive: reduce clip sizes at mobile breakpoints

### Success Criteria
- Visual flow from left to right across stat items
- Clipping enhances rather than obstructs readability
- Coordinated pattern creates cohesive design system
- Works at all breakpoints (desktop, tablet, mobile)
