# Widget Development Guide

## Overview

Matrix Panel uses a **schema-driven widget system** that provides type safety, automatic configuration UI generation, and runtime validation.

## Quick Start

### 1. Create Widget Definition

```typescript
// src/widgets/my-widget/index.ts
import { WidgetDefinition } from '@/types/widget-definition';
import { MyIcon } from 'lucide-react';
import MyWidget from './MyWidget';

export const myWidget: WidgetDefinition = {
  kind: 'my-widget',
  name: 'My Widget',
  description: 'A custom widget that does something awesome',
  icon: MyIcon,
  
  // Layout
  defaultWidth: 2,
  defaultHeight: 2,
  minWidth: 1,
  minHeight: 1,
  
  // Configuration Schema
  optionsSchema: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      defaultValue: 'My Widget',
      required: true,
      placeholder: 'Enter widget title',
    },
    {
      name: 'refreshInterval',
      label: 'Refresh Interval (seconds)',
      type: 'number',
      defaultValue: 60,
      min: 5,
      max: 3600,
    },
    {
      name: 'theme',
      label: 'Theme',
      type: 'select',
      defaultValue: 'dark',
      choices: [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
      ],
    },
  ],
  
  // Default options factory
  createDefaultOptions: () => ({
    title: 'My Widget',
    refreshInterval: 60,
    theme: 'dark',
  }),
  
  // Component
  component: MyWidget,
  
  // Optional metadata
  metadata: {
    category: 'productivity',
    tags: ['custom', 'demo'],
    version: '1.0.0',
  },
};
```

### 2. Create Widget Component

```typescript
// src/widgets/my-widget/MyWidget.tsx
import React, { useEffect, useState } from 'react';
import { BaseWidgetProps } from '@/types/widget';
import { WidgetCard } from '@/components/widgets/WidgetCard';
import { MyIcon } from 'lucide-react';

export default function MyWidget({ widgetId, options }: BaseWidgetProps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch data based on options
    const fetchData = async () => {
      setLoading(true);
      try {
        // Your data fetching logic
        const result = await fetch('/api/my-data');
        setData(await result.json());
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, options.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [options.refreshInterval]);
  
  if (loading) {
    return <WidgetCard title={options.title} loading={true} icon={MyIcon} children={null} />;
  }
  
  return (
    <WidgetCard title={options.title} icon={MyIcon}>
      <div className="p-4">
        {/* Your widget content */}
        <p>Data: {JSON.stringify(data)}</p>
      </div>
    </WidgetCard>
  );
}
```

### 3. Register Widget

```typescript
// src/widgets/index.ts
import { myWidget } from './my-widget';

// ... other imports

registerWidget(myWidget);
```

## Option Schema Types

### Text Input

```typescript
{
  name: 'url',
  label: 'URL',
  type: 'text',
  defaultValue: 'https://example.com',
  required: true,
  minLength: 5,
  maxLength: 200,
  pattern: '^https?://.+',
  placeholder: 'https://example.com',
}
```

### Number Input

```typescript
{
  name: 'timeout',
  label: 'Timeout (ms)',
  type: 'number',
  defaultValue: 5000,
  min: 1000,
  max: 30000,
  step: 1000,
}
```

### Boolean (Checkbox)

```typescript
{
  name: 'enabled',
  label: 'Enable Feature',
  type: 'boolean',
  defaultValue: true,
}
```

### Select (Dropdown)

```typescript
{
  name: 'mode',
  label: 'Display Mode',
  type: 'select',
  defaultValue: 'compact',
  choices: [
    { label: 'Compact', value: 'compact' },
    { label: 'Detailed', value: 'detailed' },
    { label: 'Grid', value: 'grid' },
  ],
}
```

### Color Picker

```typescript
{
  name: 'accentColor',
  label: 'Accent Color',
  type: 'color',
  defaultValue: '#3B82F6',
}
```

### Textarea

```typescript
{
  name: 'notes',
  label: 'Notes',
  type: 'textarea',
  defaultValue: '',
  placeholder: 'Enter your notes here...',
  maxLength: 1000,
}
```

### JSON Editor

```typescript
{
  name: 'config',
  label: 'Advanced Configuration',
  type: 'json',
  defaultValue: {},
  description: 'JSON configuration object',
}
```

## Runtime Validation

The system automatically validates options based on the schema. You can also add custom validation:

```typescript
export const myWidget: WidgetDefinition = {
  // ... other properties
  
  validateOptions: (options) => {
    if (options.startDate > options.endDate) {
      return 'Start date must be before end date';
    }
    return null; // No errors
  },
};
```

## Best Practices

1. **Always provide default values** in `createDefaultOptions()`
2. **Use `required: true`** for critical options
3. **Add descriptions** to complex options
4. **Test validation** with invalid inputs
5. **Keep configuration simple** - avoid too many options
6. **Use appropriate types** for better UX

## Migration Guide

### From Old Widget Format

**Before:**
```typescript
export const oldWidget = {
  kind: 'old',
  name: 'Old Widget',
  // Manual option handling
  defaultOptions: { url: '' },
  component: OldComponent,
};
```

**After:**
```typescript
export const newWidget: WidgetDefinition = {
  kind: 'old',
  name: 'Old Widget',
  description: 'Migrated widget with schema',
  icon: MyIcon,
  defaultWidth: 2,
  defaultHeight: 2,
  
  optionsSchema: [
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      defaultValue: '',
      required: true,
    },
  ],
  
  createDefaultOptions: () => ({ url: '' }),
  component: OldComponent,
};
```

## FAQ

**Q: How do I add a custom validation?**  
A: Use the `validateOptions` function in your widget definition.

**Q: Can I have conditional options?**  
A: Not directly in the schema, but you can handle this in your component logic.

**Q: How do I add i18n to option labels?**  
A: Use `useTranslation()` in a wrapper component or pass translations to labels.

**Q: How do I test my widget?**  
A: Create a test file in `__tests__/` directory and use React Testing Library.

---

**Last Updated**: 2026-01-18  
**Version**: 2.0.0
