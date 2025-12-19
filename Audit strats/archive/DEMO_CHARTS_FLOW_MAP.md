# Demo Charts — Flow map

Scope: `components/demo-charts.tsx` and its consumers (notably `app/admin-panel.tsx`).

## Purpose
- Provide simple chart components for the Admin Analytics modal.
- Provide time-frame-dependent demo datasets for each chart.

## Exports
- `SalesTrendChart({ isDark, timeFrame })`
- `BidActivityChart({ isDark, timeFrame })`
- `UserGrowthChart({ isDark, timeFrame })`
- `VolumeDistributionChart({ isDark, timeFrame })`

All exports are client components (file is `"use client"`).

## Inputs / Props
Shared prop shape: `DemoChartsProps`
- `isDark: boolean`
- `timeFrame: string`

## Data generation helpers
Each chart chooses a dataset by `timeFrame`, with fallback to `"7d"` when unknown.

### `generateSalesData(timeFrame)`
- Keys supported: `"7d" | "1m" | "3m" | "6m" | "1y" | "all"`.
- Returns `Array<{ name: string; sales: number }>`.

### `generateBidData(timeFrame)`
- Keys supported: `"7d" | "1m" | "3m" | "6m" | "1y" | "all"`.
- Returns `Array<{ name: string; bids: number }>`.

### `generateUserGrowthData(timeFrame)`
- Keys supported: `"7d" | "1m" | "3m" | "6m" | "1y" | "all"`.
- Returns `Array<{ name: string; users: number }>`.

### `generateVolumeData(timeFrame)`
- Keys supported: `"7d" | "1m" | "3m" | "6m" | "1y" | "all"`.
- Returns `Array<{ name: string; value: number; color: string }>`.

Note:
- Volume data includes a per-slice `color` field (hard-coded hex strings).

## Rendering and theme behavior
All charts use `recharts` with `ResponsiveContainer width="100%" height={200}`.

### Common theme rules
- Grid stroke: dark `#374151`, light `#E5E7EB`.
- Axis strokes: dark `#9CA3AF`, light `#6B7280`.
- Tooltip styles:
  - dark: black background, white border/text
  - light: white background, black border/text

### `SalesTrendChart`
- Chart type: `LineChart`.
- Data key: `sales`.
- Line + dots are white (dark) or black (light).

### `BidActivityChart`
- Chart type: `BarChart`.
- Data key: `bids`.
- Bars are white (dark) or black (light).

### `UserGrowthChart`
- Chart type: `LineChart`.
- Data key: `users`.
- Line + dots are white (dark) or black (light).

### `VolumeDistributionChart`
- Chart type: `PieChart` + `Pie`.
- Data key: `value`.
- Label renders `${name} ${percent}%` (rounded to 0 decimals).
- Slice fill uses `entry.color` (same for dark/light).

## Side effects
- No storage.
- No network.
- No timers.

## Consumer wiring (Admin Panel)
- `app/admin-panel.tsx` renders these inside the “ChartModal”, keyed by `chartType` and `modalTimeFrame`.

## Audit checklist
- Confirm the `timeFrame` keys used by the Admin Panel match the keys supported by the generators.
- Confirm hard-coded hex colors for volume slices are acceptable for the design system (currently not derived from theme tokens).
- If these should become real analytics, replace generator functions with real data sources and remove demo-only assumptions.
