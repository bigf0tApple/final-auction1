# Admin Components Flow Map

**Created:** December 19, 2025  
**Status:** Current

---

## Overview

The admin panel (`app/admin-panel.tsx`) has been refactored to extract reusable tab components into `components/admin/`. This improves code organization and maintainability.

---

## Component Hierarchy

```
app/admin-panel.tsx (1269 lines) ✨ Reduced from 1573
├── Imports from components/admin/
│   ├── AdminUsersTab
│   ├── AdminChatTab
│   ├── AdminAnalyticsTab
│   ├── AdminCharts
│   ├── AdminMintModal
│   └── AdminChartModal
│
├── Tabs Structure:
│   ├── "mint" tab      → Inline (~495 lines) - Complex, kept inline
│   ├── "users" tab     → <AdminUsersTab />
│   ├── "chat" tab      → <AdminChatTab />
│   └── "analytics" tab → <AdminAnalyticsTab />
│
└── Modals:
    ├── MintFlowModal (dynamic import)
    ├── AdminMintConfirmationModal
    └── AdminChartModal
```

---

## AdminUsersTab Props Flow

```
admin-panel.tsx
     │
     │ Props passed:
     ├── isDark: boolean
     ├── searchTerm: string
     ├── setSearchTerm: (term: string) => void
     ├── filteredUsers: MockUser[]
     └── toggleUserStatus: (address: string) => void
          │
          ▼
AdminUsersTab (components/admin/admin-users-tab.tsx)
     │
     ├── User search input
     ├── User cards display
     │   ├── Address
     │   ├── Status badge
     │   ├── Bid count
     │   ├── Reputation score
     │   └── Join date
     └── Toggle status button
```

---

## AdminChatTab Props Flow

```
admin-panel.tsx
     │
     │ Props passed:
     ├── isDark: boolean
     ├── blockedWords: string[]
     ├── newBlockedWord: string
     ├── setNewBlockedWord: (word: string) => void
     ├── addBlockedWord: () => void
     ├── removeBlockedWord: (word: string) => void
     ├── chatHistory: ChatHistoryDay[]
     ├── selectedHistoryDays: string[]
     ├── toggleHistorySelection: (date: string) => void
     ├── deleteSelectedHistory: () => void
     ├── exportSelectedHistory: () => void
     ├── viewDayHistory: (date: string, dayName: string) => void
     ├── moderationHistory: ModerationRecord[]
     └── unblacklistUser: (address: string) => void
          │
          ▼
AdminChatTab (components/admin/admin-chat-tab.tsx)
     │
     ├── Blocked Words Management
     │   ├── Add new word input
     │   └── Remove word buttons
     ├── Chat History Table
     │   ├── Checkbox selection
     │   ├── Date/day display
     │   ├── Message counts
     │   └── View/delete actions
     └── Moderation History Table
         ├── User addresses
         ├── Actions taken
         ├── Reasons
         └── Unblacklist button
```

---

## Shared Data Types

Located in: `components/admin/admin-data.ts`

```typescript
// MockUser interface
interface MockUser {
  address: string
  status: "active" | "flagged" | "blocked"
  username?: string
  bidCount: number
  reputation?: number
  joinDate: string
}

// ChatHistoryDay interface  
interface ChatHistoryDay {
  date: string
  dayName: string
  messageCount: number
  activeUsers: number
  warnings: number
}

// ModerationRecord interface
interface ModerationRecord {
  id: number
  userAddress: string
  action: string
  reason: string
  date: string
  status: string
}
```

---

## State Management Pattern

```
admin-panel.tsx OWNS state
     │
     ├── User state:
     │   └── searchTerm, filtered users (via useMemo)
     │
     ├── Chat state:
     │   ├── blockedWords (useState + Supabase)
     │   ├── chatHistory (mock data)
     │   ├── selectedHistoryDays
     │   └── moderationHistory (mock data)
     │
     └── PASSES state + handlers as props
              │
              ▼
     Child components are PURE/DISPLAY ONLY
     - They receive data via props
     - They call parent handlers for mutations
     - No internal state that affects parent
```

---

## Key Integration Points

| From | To | Type | Purpose |
|------|-----|------|---------|
| admin-panel.tsx | AdminUsersTab | Props | User management UI |
| admin-panel.tsx | AdminChatTab | Props | Chat moderation UI |
| admin-panel.tsx | AdminCharts | Props | Analytics visualization |
| AdminChatTab | admin-panel.tsx | Callback | Add/remove blocked words |
| AdminUsersTab | admin-panel.tsx | Callback | Toggle user status |

---

## Extraction Summary (Dec 19, 2025)

### ✅ Completed Extractions

| Component | Location | Lines | Props |
|-----------|----------|-------|-------|
| AdminUsersTab | `admin-users-tab.tsx` | 108 | 5 props |
| AdminChatTab | `admin-chat-tab.tsx` | 275 | 12 props |
| AdminAnalyticsTab | `admin-analytics-tab.tsx` | 69 | 6 props |

**Total Lines Saved:** 304 (1573 → 1269)

### Not Extracted (By Design)

**AdminMintTab**
- **Lines:** ~495
- **Complexity:** High (form state, validation, file uploads, Supabase integration)
- **Decision:** Kept inline due to tight coupling with parent state
- **Recommendation:** Could be extracted if form state moved to custom hook

---

## Testing Notes

When testing admin functionality:
1. **User Management:** Filter works, status toggles update UI
2. **Chat Moderation:** Words add/remove, history selection works
3. **Integration:** Props flow correctly between parent and tabs
4. **Performance:** Memoization prevents unnecessary re-renders
