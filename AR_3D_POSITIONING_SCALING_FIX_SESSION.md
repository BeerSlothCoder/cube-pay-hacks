# AR 3D Positioning & Scaling Fix Session

**Date:** February 6, 2026  
**Branch:** `artm-virtual-terminal-implementation`  
**Status:** Documentation Reference

---

## Problem

Two POS terminal 3D objects (POS 1 and POS 2) were experiencing:

1. **Overlapping** on screen despite having different database coordinates
2. **Only visible in the top half** of the screen — a horizontal line cut the viewport in half
3. **Too large** on screen

---

## Root Cause Analysis

### Screen Split Issue

- **ARViewer.jsx**: The 3D container used `style={{ minHeight: "500px" }}` instead of full viewport height, limiting the Three.js Canvas to 500px
- **CameraView.jsx**: The camera feed wrapper used `aspect-video` CSS class (Tailwind), which forces a 16:9 aspect ratio and clips content outside that ratio

### Overlapping Issue

- POS 1 was in `gps` positioning mode with no screen coordinates — it fell back to default position
- POS 2 had screen coordinates but the constrained viewport pushed both into the same visible area

### Size Issue

- `PaymentTerminalPOSModel` and `MyPersonalTerminalModel` both used `scale={3.0}` — far too large for screen-positioned objects

---

## Fixes Applied

### 1. ARViewer.jsx — Full Viewport Height

```diff
- <div className="relative" style={{ minHeight: "500px" }}>
+ <div className="relative" style={{ height: "100vh", width: "100%" }}>
```

**Impact:** Allows 3D canvas to use full viewport height instead of being constrained to 500px

### 2. CameraView.jsx — Remove Aspect Ratio Constraint

```diff
- <div className="relative aspect-video bg-slate-900 overflow-hidden">
+ <div className="relative w-full h-full bg-slate-900 overflow-hidden">
```

Also added `h-full` to the outer `div`, `Card`, and `CardContent` wrappers so height propagates through the full component tree.

**Impact:** Camera view no longer forces 16:9 aspect ratio, uses full viewport

### 3. Database — Screen Positioning

Both POS terminals updated to screen positioning mode and moved up:

| Agent         | positioning_mode | screen_position_x | screen_position_y |
| ------------- | ---------------- | ----------------- | ----------------- |
| POS 1 No x,y  | screen           | 25%               | 15%               |
| POS 2 with x.y | screen           | 75%               | 15%               |

**SQL Updates:**

```sql
-- POS 1
UPDATE deployed_objects 
SET 
  positioning_mode = 'screen',
  screen_position_x = 25,
  screen_position_y = 15
WHERE agent_name = 'POS 1 No x,y';

-- POS 2  
UPDATE deployed_objects
SET
  positioning_mode = 'screen',
  screen_position_x = 75,
  screen_position_y = 15
WHERE agent_name = 'POS 2 with x.y';
```

**Impact:** Proper positioning mode set, agents positioned in top left and top right of screen

### 4. Enhanced3DAgent.jsx — Smaller Models

```diff
# PaymentTerminalPOSModel
- scale={3.0}
- position={[0, -4, -3]}
+ scale={0.8}
+ position={[0, -1, -0.8]}

# MyPersonalTerminalModel
- scale={3.0}
- position={[0, -4, -3]}
+ scale={0.8}
+ position={[0, -1, -0.8]}
```

**Impact:** Models scaled down to 27% of original size, positioned closer to camera for better screen visibility

---

## Files Modified

| File                                    | Change                                                        |
| --------------------------------------- | ------------------------------------------------------------- |
| `src/components/ARViewer.jsx`           | 3D container: `minHeight: 500px` → `height: 100vh`           |
| `src/components/CameraView.jsx`         | Removed `aspect-video`, added `h-full` to Card chain         |
| `src/components/Enhanced3DAgent.jsx`    | POS model scale `3.0` → `0.8`, adjusted positions            |
| **Database** (`deployed_objects` table) | Both POS agents set to screen mode at (25%,15%) and (75%,15%) |

---

## Before/After Comparison

### Before

```
┌─────────────────────────┐
│   Visible Area (500px)  │
│                         │
│  [POS1+POS2 Overlap]   │ ← Both at same position, huge
│                         │
├─────────────────────────┤ ← Horizontal cut-off line
│   Hidden Area           │
│                         │
│   (bottom half)         │
│                         │
└─────────────────────────┘
```

### After

```
┌─────────────────────────┐
│  [POS1]         [POS2]  │ ← Separated, visible top area
│  (25%, 15%)   (75%, 15%)│
│                         │
│                         │
│                         │
│   Full Viewport         │
│   (100vh)               │
│                         │
│                         │
└─────────────────────────┘
```

---

## Technical Details

### Viewport Height Propagation

For full viewport height to work in React/Tailwind, height must propagate through the component tree:

```jsx
// ❌ WRONG - height doesn't propagate
<div className="relative">
  <Card>
    <CardContent>
      <div style={{ height: "100vh" }} /> {/* Ignored! */}
    </CardContent>
  </Card>
</div>

// ✅ CORRECT - height propagates
<div className="relative h-full">
  <Card className="h-full">
    <CardContent className="h-full">
      <div style={{ height: "100vh" }} /> {/* Works! */}
    </CardContent>
  </Card>
</div>
```

### Scale Factor Calculation

Screen-positioned 3D objects need different scales than GPS-positioned:

- **GPS-positioned** (real-world): `scale={3.0}` works because distance creates natural sizing
- **Screen-positioned** (overlay): `scale={0.8}` needed because camera is close and frustum clips large objects

**Formula:**
```
Screen scale ≈ GPS scale × (viewport distance / GPS distance)
Screen scale ≈ 3.0 × (2 / 10) = 0.6 to 0.8
```

### Positioning Mode Logic

```typescript
if (agent.positioning_mode === "screen") {
  // Use screen coordinates (X%, Y%)
  const screenPos = convertScreenPercentToAR(
    agent.screen_position_x,
    agent.screen_position_y
  );
  return <Model position={screenPos} scale={0.8} />;
} else {
  // Use GPS coordinates
  const gpsPos = gpsTo3DPosition(
    userLat,
    userLon,
    agent.latitude,
    agent.longitude
  );
  return <Model position={gpsPos} scale={3.0} />;
}
```

---

## Supabase Connection Note

The project migrated to new Supabase API keys:

- **URL:** `https://ncjbwzibnqrbrvicdmec.supabase.co`
- **Publishable key:** `sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA` (read-only due to RLS)
- **Secret key:** `sb_secret_s3sWA4HPYMpD-_I-GEzsIw_g92UJm9S` (required for writes)
- Legacy JWT keys are **disabled** as of 2025-10-26

**Environment Variables:**

```bash
VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA
VITE_SUPABASE_SECRET_KEY=sb_secret_s3sWA4HPYMpD-_I-GEzsIw_g92UJm9S
```

---

## Testing Checklist

- [x] Verify both POS agents visible on screen
- [x] Confirm no overlap between agents
- [x] Check agents positioned at correct screen locations (25% & 75%)
- [x] Verify full viewport height (no horizontal cut-off)
- [x] Confirm model scales appropriate for screen display
- [x] Test in both portrait and landscape orientations
- [x] Verify positioning_mode = 'screen' in database
- [x] Confirm screen_position_x and screen_position_y values correct

---

## Related Issues

- **Dual Rendering Bug**: Fixed in previous session (agents showing in both GPS and screen views)
- **Agent Type Confusion**: Fixed with clean snake_case types (`artm_terminal`, `pos_terminal`, `my_payment_terminal`)
- **Viewport Constraints**: Fixed by removing aspect ratio and height restrictions

---

## Key Learnings

### 1. CSS Height Propagation

Tailwind's utility classes require explicit height on all parent elements:
- Use `h-full` on all wrappers when child needs full height
- `inset-0` is preferred for absolute positioned full-viewport elements
- Avoid mixing inline styles with Tailwind classes

### 2. AR Positioning Systems

Two distinct systems require different approaches:
- **GPS Mode**: Large scale (3.0+), distance-based visibility
- **Screen Mode**: Small scale (0.8), fixed screen position

Never mix these — always check `positioning_mode` first!

### 3. Three.js Canvas Constraints

- Canvas respects parent container dimensions
- `minHeight` creates layout issues (forces minimum, not actual height)
- Use `height: 100vh` or `h-screen` for full viewport
- Camera FOV and position must account for scale differences

---

## Future Improvements

1. **Dynamic Scaling**
   - Auto-adjust scale based on screen size
   - Responsive models for mobile vs desktop

2. **Collision Detection**
   - Prevent overlap when multiple screen-positioned agents exist
   - Auto-adjust positions if overlap detected

3. **Configuration UI**
   - Allow runtime adjustment of scale and position
   - Visual editor for screen coordinate placement

4. **Performance Optimization**
   - LOD (Level of Detail) for different scales
   - Frustum culling for off-screen agents

---

## Implementation Status

**Current Branch:** `artm-virtual-terminal-implementation`  
**Status:** ✅ Fixes Verified  
**Tested On:** Development environment  
**Database:** Updated with correct positioning mode  

**Next Steps:**
1. Merge into main branch
2. Deploy to staging environment
3. Verify on mobile devices
4. Update deployment documentation

---

**Last Updated:** February 6, 2026  
**Documented By:** Session Summary Capture  
**Related Docs:**
- [AR_VIEWER_DUAL_RENDERING_FIX_COMPLETE.md](./AR_VIEWER_DUAL_RENDERING_FIX_COMPLETE.md)
- [ARTM_IMPLEMENTATION_SESSION.md](./ARTM_IMPLEMENTATION_SESSION.md)
