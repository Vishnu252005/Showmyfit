# 🔄 Migration Example: Converting HomePage to Next.js

## Before (Vite + React Router)

**File**: `src/pages/HomePage.tsx`

```tsx
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/product/123');
  };
  
  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={handleClick}>View Product</button>
    </div>
  );
}
```

**Routing**: `src/App.tsx`
```tsx
<Route path="/" element={<HomePage />} />
```

---

## After (Next.js)

**File**: `app/page.tsx` (This IS your home page!)

```tsx
'use client'; // Only if you use hooks/interactivity

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/product/123');
  };
  
  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={handleClick}>View Product</button>
    </div>
  );
}
```

**Routing**: Automatic! File at `app/page.tsx` = route `/`

---

## Converting Product Detail Page

### Before (React Router)
**File**: `src/pages/product/ProductDetailPage.tsx`
```tsx
import { useParams } from 'react-router-dom';

export default function ProductDetailPage() {
  const { productId } = useParams();
  // ...
}
```

**Routing**: 
```tsx
<Route path="/product/:productId" element={<ProductDetailPage />} />
```

### After (Next.js)
**File**: `app/product/[productId]/page.tsx`
```tsx
export default function ProductDetailPage({ params }: { params: { productId: string } }) {
  const { productId } = params;
  // ...
}
```

**Routing**: Automatic! File at `app/product/[productId]/page.tsx` = route `/product/:productId`

---

## Converting with Context Providers

### Before (App.tsx)
```tsx
<AuthProvider>
  <AppProvider>
    <CartProvider>
      <Router>
        <Routes>...</Routes>
      </Router>
    </CartProvider>
  </AppProvider>
</AuthProvider>
```

### After (app/layout.tsx)
```tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { CartProvider } from '@/contexts/CartContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## Key Differences Summary

| Feature | React Router (Vite) | Next.js |
|---------|-------------------|---------|
| **Routing** | `<Route path="/" element={...} />` | File at `app/page.tsx` |
| **Navigation** | `useNavigate()` | `useRouter()` from `next/navigation` |
| **Params** | `useParams()` | `params` prop in page component |
| **Layout** | Wrapper component | `app/layout.tsx` |
| **SEO** | Manual `<SEOHead>` | Built-in `metadata` export |
| **Images** | `<img>` or custom | `<Image>` from `next/image` |

---

## Quick Conversion Checklist

For each page:
- [ ] Move from `src/pages/` to `app/[route]/page.tsx`
- [ ] Replace `useNavigate` with `useRouter` from `next/navigation`
- [ ] Replace `useParams` with `params` prop
- [ ] Add `'use client'` if using hooks/interactivity
- [ ] Update imports (remove react-router-dom)
- [ ] Test the route

