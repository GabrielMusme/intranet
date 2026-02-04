# Guía: Sistema de Temas con next-themes

## Migración completada ✅

Tu proyecto ha sido migrado exitosamente de `theme-context` personalizado a **next-themes**.

### Cambios realizados:

1. ✅ Instalado `next-themes` (v0.4.6)
2. ✅ Actualizado `app/layout.tsx` con `ThemeProvider`
3. ✅ Reemplazados imports en componentes:
   - `topbar.tsx`
   - `theme-toggle.tsx`
   - `glow-card.tsx` (ya lo usaba)
4. ✅ Eliminado archivo `contexts/theme-context.tsx`
5. ✅ Creado componente `ThemeSelector` para futuras extensiones

---

## Cómo agregar temas personalizados

### Opción 1: Agregar temas en `app/globals.css`

Añade nuevas clases CSS con variables personalizadas:

```css
/* Tema Ocean */
.ocean {
  --background: oklch(0.95 0.001 200);
  --foreground: oklch(0.2 0.04 200);
  --primary: oklch(0.5 0.2 200); /* Azul océano */
  --secondary: oklch(0.6 0.15 180);
  --accent: oklch(0.7 0.12 190);
  /* ... más variables según necesites */
}

.ocean.dark {
  --background: oklch(0.15 0.02 200);
  --foreground: oklch(0.95 0.01 200);
  --primary: oklch(0.6 0.18 200);
  /* ... */
}

/* Tema Sunset */
.sunset {
  --background: oklch(0.95 0.002 30);
  --foreground: oklch(0.2 0.05 30);
  --primary: oklch(0.6 0.25 30); /* Naranja/Rojo */
  --secondary: oklch(0.7 0.15 45);
  --accent: oklch(0.8 0.1 60);
  /* ... */
}

.sunset.dark {
  --background: oklch(0.15 0.03 30);
  --foreground: oklch(0.95 0.01 30);
  --primary: oklch(0.7 0.2 30);
  /* ... */
}
```

### Opción 2: Crear archivos CSS separados

Estructura recomendada:

```
app/
├── globals.css
└── themes/
    ├── light.css
    ├── dark.css
    ├── ocean.css
    └── sunset.css
```

En `app/globals.css`, importa los temas:

```css
@import "themes/light.css";
@import "themes/dark.css";
@import "themes/ocean.css";
@import "themes/sunset.css";
```

---

## Cómo usar los temas en componentes

### Cambiar tema programáticamente:

```tsx
"use client";

import { useTheme } from "next-themes";

export function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div>
      {/* Tema actual seleccionado */}
      <p>Tema: {theme}</p>

      {/* Tema resuelto (real aplicado) */}
      <p>Color fondo: {resolvedTheme === "dark" ? "Oscuro" : "Claro"}</p>

      {/* Cambiar tema */}
      <button onClick={() => setTheme("dark")}>Oscuro</button>
      <button onClick={() => setTheme("light")}>Claro</button>
      <button onClick={() => setTheme("ocean")}>Océano</button>
      <button onClick={() => setTheme("sunset")}>Atardecer</button>
    </div>
  );
}
```

### Usar ThemeSelector (componente creado):

```tsx
import { ThemeSelector } from "@/components/shared/theme-selector";

export default function Settings() {
  return (
    <div>
      <h2>Selecciona un tema:</h2>
      <ThemeSelector />
    </div>
  );
}
```

---

## APIs de next-themes

```tsx
const {
  theme, // "light" | "dark" | "system" | tema personalizado
  setTheme, // (theme: string) => void
  themes, // Array de temas disponibles
  systemTheme, // Tema del SO
  resolvedTheme, // El tema real aplicado (light o dark)
  forcedTheme, // Tema forzado (si existe)
} = useTheme();
```

---

## Estructura de variables CSS actual

Tu proyecto ya tiene definidas todas estas variables en `:root` y `.dark`:

- `--background`
- `--foreground`
- `--primary`
- `--secondary`
- `--muted`
- `--accent`
- `--destructive`
- `--border`
- `--input`
- `--ring`
- `--sidebar-*` (variables de sidebar)
- `--chart-*` (variables de gráficos)

### Para agregar un tema personalizado, solo necesitas redefinir estas variables en una nueva clase CSS.

---

## Configuración en `app/layout.tsx`

```tsx
<ThemeProvider
  attribute="class" // Usa la clase en el HTML root
  defaultTheme="system" // Tema por defecto
  enableSystem // Detecta preferencia del SO
  disableTransitionOnChange // Evita transiciones al cambiar tema
  storageKey="app-theme" 
>
  {children}
</ThemeProvider>
```

---

## Ejemplo completo: Agregar tema "Nord"

### 1. En `app/globals.css`, agrega:

```css
.nord {
  --background: oklch(0.95 0.001 220);
  --foreground: oklch(0.2 0.04 220);
  --primary: oklch(0.5 0.18 200); /* Azul Nord */
  --secondary: oklch(0.65 0.12 180);
  --accent: oklch(0.75 0.1 190);
  --card: oklch(0.92 0.002 220);
  --border: oklch(0.85 0.003 220);
  --muted: oklch(0.88 0.002 220);
  --muted-foreground: oklch(0.45 0.03 220);
}

.nord.dark {
  --background: oklch(0.15 0.02 220);
  --foreground: oklch(0.95 0.01 220);
  --primary: oklch(0.6 0.16 200);
  --secondary: oklch(0.55 0.12 180);
  --accent: oklch(0.7 0.1 190);
  --card: oklch(0.22 0.01 220);
  --border: oklch(0.3 0.01 220);
  --muted: oklch(0.28 0.01 220);
  --muted-foreground: oklch(0.65 0.02 220);
}
```

### 2. Actualiza `ThemeSelector`:

```tsx
const themes = [
  { id: "light", label: "Claro" },
  { id: "dark", label: "Oscuro" },
  { id: "nord", label: "Nord" },
  { id: "system", label: "Sistema" },
];
```

### 3. ¡Listo! Puedes cambiar a ese tema:

```tsx
setTheme("nord");
```

---

## Notas importantes

- **Suppressión de warning**: El `suppressHydrationWarning` en `<html>` es necesario para evitar warnings de hydration (next-themes lo requiere)
- **`resolvedTheme`**: Usa esto para condicionales que necesitan el valor real (light o dark), no "system"
- **`theme`**: Usa esto para mostrar qué tema está seleccionado
- **SSR**: next-themes maneja correctamente el Server-Side Rendering, no tendrás "flash" de tema incorrecto

---

Disfruta de tu nuevo sistema de temas 🎨
