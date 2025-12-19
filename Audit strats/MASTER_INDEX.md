# ARPO Studio - Audit Documentation Master Index

**Updated:** December 19, 2025  
**Active Files:** 13  
**Archived Files:** 63 (in `archive/` folder)

---

## 🔴 Current & Critical (Must Read)

| File | Purpose | Last Updated |
|------|---------|--------------| 
| `COMPREHENSIVE_AUDIT_DEC19.md` | **Latest full audit** - 88% health score | Dec 19 |
| `ARCHITECTURE_OVERVIEW.md` | System architecture & component hierarchy | Dec 19 |
| `SECURITY_AUDIT_REPORT.md` | Security findings - all medium issues fixed | Dec 19 |
| `CODE_QUALITY_AUDIT_REPORT.md` | Code quality issues & tracking | Dec 18 |
| `ADMIN_COMPONENTS_FLOW_MAP.md` | **NEW** - Extracted admin tab components | Dec 19 |

---

## 🟡 Strategy Templates (Reference)

| File | Purpose |
|------|---------|
| `01_BUTTON_AUDIT_STRATEGY.md` | Template for auditing button interactions |
| `02_COMPONENT_CONNECTIONS_STRATEGY.md` | Template for component dependency audits |
| `03_FEATURE_FLOW_STRATEGY.md` | Template for feature flow documentation |
| `04_REGRESSION_MATRIX_TEMPLATE.md` | Template for regression testing |
| `05_STORAGE_AND_SIDE_EFFECTS_STRATEGY.md` | Template for storage audits |

---

## 🟢 Active Flow Maps

### Admin Panel (Current)
- `ADMIN_COMPONENTS_FLOW_MAP.md` - **NEW Dec 19** - AdminUsersTab, AdminChatTab

### Auction Scheduling
- `AUCTION_SCHEDULE_LOGIC_MAP.md` - Still active reference

> **Note:** 63 legacy flow maps have been moved to `archive/` folder. 
> They remain available for reference but are no longer actively maintained.

### Auction Core
- `AUCTION_HOME_PAGE_FLOW_MAP.md`
- `AUCTION_CONTEXT_AND_STATE_FLOW_MAP.md`
- `AUCTION_STATE_ACTIONS_MAP.md`
- `AUCTION_DATA_SOURCE_AND_HELPERS_FLOW_MAP.md`
- `AUCTION_SCHEDULE_LOGIC_MAP.md`
- `AUCTION_END_RESET_FLOW_MAP.md`

### Bidding System
- `BIDDING_ENGINE_FLOW_MAP.md`
- `BIDDING_RULES_AND_GUARDS_MAP.md`
- `BID_POOL_MANAGER_FLOW_MAP.md`
- `MAX_PAIN_AND_BID_POOLS_FLOW_MAP.md`
- `MAX_PAIN_CONTROLLER_FLOW_MAP.md`
- `BID_NOTIFICATIONS_AND_TOASTS_FLOW_MAP.md`

### Chat System
- `AUCTION_CHAT_COMPONENT_FLOW_MAP.md`
- `AUCTION_CHAT_QUICK_BID_FLOW_MAP.md`
- `CHAT_BUTTON_AND_PINNING_FLOW_MAP.md`
- `CHAT_HISTORY_LIFECYCLE_FLOW_MAP.md`
- `CONTENT_MODERATION_BLOCKED_WORDS_FLOW_MAP.md`

### Wallet & Identity
- `WALLET_CONNECT_AND_IDENTITY_FLOW_MAP.md`
- `DISPLAY_NAME_AND_IDENTITY_FLOW_MAP.md`
- `TIER_SYSTEM_AND_BADGES_FLOW_MAP.md`

### Notifications
- `REMINDER_NOTIFICATIONS_FLOW_MAP.md`
- `BID_NOTIFICATION_COMPONENT_FLOW_MAP.md`

### UI Components
- `NAVIGATION_AND_MODAL_LAUNCH_FLOW_MAP.md`
- `THEME_PROVIDER_COMPONENT_FLOW_MAP.md`
- `MOBILE_MENU_COMPONENT_FLOW_MAP.md`
- `SIDEBAR_COMPONENT_FLOW_MAP.md`

### Pages
- `SOLD_PAGES_FLOW_MAP.md`
- `CATEGORIES_PAGE_FLOW_MAP.md`
- `STATIC_PAGES_FLOW_MAP.md`

### Hooks
- `USE_AUCTION_STATE_HOOK_FLOW_MAP.md`
- `USE_CHAT_PINNED_HOOK_FLOW_MAP.md`
- `USE_IS_MOBILE_HOOK_FLOW_MAP.md`
- `USE_TOAST_HOOK_FLOW_MAP.md`

---

## ⚪ Button Maps (Specialized)

| File | Coverage |
|------|----------|
| `ADMIN_PANEL_BUTTON_MAP.md` | Admin interface buttons |
| `AUCTION_PAGE_BUTTON_MAP.md` | Main auction page buttons |
| `CATEGORIES_PAGE_BUTTON_MAP.md` | Categories page buttons |
| `MODALS_BUTTON_MAP.md` | Modal interaction buttons |
| `NAVIGATION_SURFACE_BUTTON_MAP.md` | Navigation buttons |
| `CHAT_BUTTON_MAP.md` | Chat interface buttons |

---

## 📁 File Organization Recommendations

### Keep Active (7 files)
1. `MASTER_INDEX.md` (this file)
2. `COMPREHENSIVE_AUDIT_DEC19.md`
3. `ARCHITECTURE_OVERVIEW.md`
4. `SECURITY_AUDIT_REPORT.md`
5. `CODE_QUALITY_AUDIT_REPORT.md`
6. `STORAGE_KEYS_MAP.md`
7. Strategy templates (01-05)

### Archive Candidates (67 files)
All `*_FLOW_MAP.md` and `*_BUTTON_MAP.md` files can be moved to an `archive/` subfolder as they were one-time documentation efforts. Keep them for reference but they don't need active maintenance.

---

## Quick Navigation

```bash
# View latest audit
cat "Audit strats/COMPREHENSIVE_AUDIT_DEC19.md"

# View architecture
cat "Audit strats/ARCHITECTURE_OVERVIEW.md"

# Count all docs
ls "Audit strats/" | wc -l
```

---

## Health Summary (Dec 19, 2025)

| Metric | Score |
|--------|-------|
| Type Safety | 100% (0 `any` types) |
| TODOs | 0 remaining |
| Security | 98% |
| Performance | 90% |
| **Overall** | **88% HEALTHY** |
