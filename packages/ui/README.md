# @cube-pay/ui

Shared UI components for CubePay with black/cream theme.

## Features

- **Theme**: Complete design system with black (#1a1a1a) background and cream (#f5f5dc) text
- **Button**: Primary, secondary, outline, and ghost variants
- **Input**: Form inputs with labels, errors, and helper text
- **Modal**: Accessible modal dialogs with customizable sizes
- **CubeCanvas**: Three.js payment cube preview component

## Installation

```bash
npm install @cube-pay/ui
```

## Usage

### Theme

```typescript
import { theme } from '@cube-pay/ui';

// Use theme values in your components
const MyComponent = () => (
  <div style={{
    backgroundColor: theme.colors.bgBlack,
    color: theme.colors.textCream,
    padding: theme.spacing.md,
  }}>
    Content
  </div>
);
```

### Button

```typescript
import { Button } from '@cube-pay/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="secondary" loading>
  Loading...
</Button>

<Button variant="outline" fullWidth>
  Full Width
</Button>
```

### Input

```typescript
import { Input } from '@cube-pay/ui';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  fullWidth
/>

<Input
  label="Amount"
  type="number"
  error="Amount must be greater than 0"
/>
```

### Modal

```typescript
import { Modal, Button } from '@cube-pay/ui';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Payment Confirmation"
  size="md"
  footer={
    <>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure you want to proceed with this payment?</p>
</Modal>
```

### CubeCanvas

```typescript
import { CubeCanvas } from '@cube-pay/ui';

<CubeCanvas
  width={400}
  height={400}
  enableRotation
  enableInteraction
  onCubeClick={(faceIndex) => {
    console.log('Clicked face:', faceIndex);
  }}
/>
```

## Design System

### Colors

```typescript
theme.colors = {
  bgBlack: "#1a1a1a", // Background
  textCream: "#f5f5dc", // Primary text
  cubeBlue: "#0066cc", // Primary accent
  accentGold: "#ffd700", // Secondary accent
  accentGreen: "#00ff88", // Success
  errorRed: "#ff4444", // Error

  // Payment face colors
  faceBlue: "#0066cc", // Crypto QR
  faceTeal: "#00aa88", // Sound Pay
  facePurple: "#8800aa", // Voice Pay
  faceOrange: "#aa6600", // Virtual Card
  faceCyan: "#00aacc", // ENS Payment
  faceMagenta: "#cc0066", // On-Ramp
};
```

### Spacing

```typescript
theme.spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
};
```

### Typography

```typescript
theme.fontSize = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
};

theme.fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};
```

## License

MIT
