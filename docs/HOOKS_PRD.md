# Hook App - React Hooks Product Requirements Document (PRD)

## Executive Summary

This document provides a comprehensive overview of all custom React hooks used in the Hook application - a social discovery and creator monetization platform. The hooks are organized by functional domain and provide core business logic for user authentication, gamification, monetization, messaging, and social features.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication & User Management](#authentication--user-management)
3. [Gamification System](#gamification-system)
4. [Discovery & Matching](#discovery--matching)
5. [Messaging & Conversations](#messaging--conversations)
6. [Monetization & Payments](#monetization--payments)
7. [Content & Posts](#content--posts)
8. [Social Features](#social-features)
9. [Notifications & Presence](#notifications--presence)
10. [Admin & Analytics](#admin--analytics)
11. [Utility Hooks](#utility-hooks)
12. [Dependencies & Integration](#dependencies--integration)
13. [Best Practices](#best-practices)

---

## Architecture Overview

### Technology Stack
- **Frontend**: React 18.3.1, TypeScript
- **State Management**: React Query (@tanstack/react-query)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Styling**: Tailwind CSS

### Hook Design Principles
1. **Single Responsibility**: Each hook handles one domain of functionality
2. **Real-time First**: Many hooks include Supabase real-time subscriptions
3. **Optimistic Updates**: Local state is updated immediately, then synced with backend
4. **Error Handling**: Consistent error handling with toast notifications
5. **Type Safety**: Full TypeScript support with defined interfaces

---

## Authentication & User Management

### `useProfile`
**File**: `src/hooks/useProfile.tsx`

**Purpose**: Manages user profile data including fetching, creating, updating, and avatar management.

**Interface**:
```typescript
interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  bio?: string;
  avatar_url?: string;
  interests?: string[];
  gender: string;
  gender_preference: string;
  location_city: string;
  location_state: string;
  user_type: 'creator' | 'consumer';
  verification_status?: 'verified' | 'pending' | 'rejected';
  verification_video_url?: string;
  subscription_fee?: number;
  // ... additional fields
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `profile` | `Profile \| null` | Current user's profile data |
| `loading` | `boolean` | Loading state |
| `createProfile` | `function` | Creates a new profile |
| `updateProfile` | `function` | Updates existing profile |
| `uploadAvatar` | `function` | Uploads avatar image |
| `uploadAvatarDuringSetup` | `function` | Avatar upload for onboarding |
| `refetch` | `function` | Refreshes profile data |

**Use Cases**:
- Profile setup during onboarding
- Profile editing
- Avatar management
- Verification video storage

---

### `useUserRoles`
**File**: `src/hooks/useUserRoles.tsx`

**Purpose**: Fetches and manages user roles for access control (admin, moderator, user).

**Interface**:
```typescript
type UserRole = 'admin' | 'moderator' | 'user';
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `roles` | `UserRole[]` | Array of user's roles |
| `hasRole` | `(role: UserRole) => boolean` | Check for specific role |
| `isAdmin` | `boolean` | Admin role check |
| `isModerator` | `boolean` | Moderator role check |
| `loading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message if any |

**Use Cases**:
- Route protection for admin pages
- Conditional UI rendering based on permissions
- Feature gating

---

### `usePin`
**File**: `src/hooks/usePin.ts`

**Purpose**: Manages withdrawal PIN for secure financial transactions.

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `setPin` | `(pin: string) => Promise` | Sets user's withdrawal PIN |
| `verifyPin` | `(pin: string) => Promise<boolean>` | Verifies entered PIN |
| `loading` | `boolean` | Loading state |

**Use Cases**:
- Setting up withdrawal security
- Verifying identity before withdrawals

---

## Gamification System

### `useAchievements`
**File**: `src/hooks/useAchievements.tsx`

**Purpose**: Manages achievement system including fetching, tracking progress, and awarding achievements.

**Interface**:
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  keys_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  is_completed: boolean;
  earned_at: string;
  achievement: Achievement;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `achievements` | `Achievement[]` | All available achievements |
| `userAchievements` | `UserAchievement[]` | User's achievement progress |
| `loading` | `boolean` | Loading state |
| `getAchievementProgress` | `function` | Get progress for specific achievement |
| `isAchievementCompleted` | `function` | Check if achievement is completed |
| `getCompletedAchievements` | `function` | Get all completed achievements |
| `getAchievementsByCategory` | `function` | Filter by category |
| `checkAchievements` | `function` | Trigger achievement check |
| `refetch` | `function` | Refresh achievement data |

**Use Cases**:
- Achievement display screens
- Progress tracking
- Reward distribution
- Gamification UI elements

---

### `useChallenges`
**File**: `src/hooks/useChallenges.tsx`

**Purpose**: Manages daily, weekly, and monthly challenges for user engagement.

**Interface**:
```typescript
interface Challenge {
  id: string;
  name: string;
  description: string;
  challenge_type: 'daily' | 'weekly' | 'monthly' | 'event';
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  keys_reward: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  is_completed: boolean;
  completed_at: string | null;
  challenge: Challenge;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `challenges` | `Challenge[]` | All active challenges |
| `userChallenges` | `UserChallenge[]` | User's challenge progress |
| `loading` | `boolean` | Loading state |
| `getChallengeProgress` | `function` | Get progress for challenge |
| `isChallengeCompleted` | `function` | Check completion status |
| `getCompletedChallenges` | `function` | Get all completed challenges |
| `getChallengesByType` | `function` | Filter by type |
| `getActiveChallenges` | `function` | Get non-expired, incomplete challenges |
| `getDaysUntilExpiry` | `function` | Days remaining |
| `getHoursUntilExpiry` | `function` | Hours remaining |
| `updateChallengeProgress` | `function` | Update progress |
| `refetch` | `function` | Refresh data |

**Use Cases**:
- Challenge display screens
- Progress bars
- Countdown timers
- Reward claiming

---

### `useExperience`
**File**: `src/hooks/useExperience.tsx`

**Purpose**: Manages user experience points (XP) and leveling system.

**Interface**:
```typescript
interface UserExperience {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  discovery_level: number;
  match_level: number;
  social_level: number;
  created_at: string;
  updated_at: string;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `experience` | `UserExperience \| null` | User's XP data |
| `loading` | `boolean` | Loading state |
| `addExperience` | `(xpAmount: number) => void` | Add XP to user |
| `getLevelProgress` | `() => number` | Progress to next level (0-100) |
| `getXpForLevel` | `(level: number) => number` | XP required for level |
| `getTotalXpForLevel` | `(level: number) => number` | Cumulative XP for level |
| `getLevelFromXp` | `(totalXp: number) => number` | Calculate level from XP |
| `getRankTitle` | `(level: number) => string` | Get rank title (Newcomer, Explorer, etc.) |
| `refetch` | `function` | Refresh data |

**Rank Titles**:
- Levels 1-5: Newcomer
- Levels 6-10: Explorer
- Levels 11-20: Adventurer
- Levels 21-35: Expert
- Levels 36-50: Master
- Levels 51-75: Legend
- Level 76+: Mythical

**Use Cases**:
- XP bars and progress displays
- Level-up animations
- Rank badges
- Unlocking features

---

### `useActivityTracker`
**File**: `src/hooks/useActivityTracker.tsx`

**Purpose**: Tracks user activity streaks and discovery engagement.

**Interface**:
```typescript
interface ActivityData {
  currentStreak: number;
  longestStreak: number;
  totalDiscoveryDays: number;
  lastActiveDate: string;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `activity` | `ActivityData` | User's activity data |
| `loading` | `boolean` | Loading state |
| `updateStreak` | `function` | Update streak (call on user activity) |
| `refetch` | `function` | Refresh data |

**Use Cases**:
- Streak displays
- Daily login rewards
- Engagement metrics

---

### `useDailyStats`
**File**: `src/hooks/useDailyStats.tsx`

**Purpose**: Tracks daily user statistics including swipes, matches, and super likes.

**Interface**:
```typescript
interface DailyStats {
  todaySwipes: number;
  todayMatches: number;
  todaySuperLikes: number;
  currentStreak: number;
  longestStreak: number;
  totalDiscoveryDays: number;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `stats` | `DailyStats` | Today's statistics |
| `loading` | `boolean` | Loading state |
| `incrementSwipes` | `function` | Increment swipe count |
| `incrementSuperLikes` | `function` | Increment super like count |
| `refetch` | `function` | Refresh data |

**Use Cases**:
- Daily stats display
- Usage limits
- Gamification triggers

---

### `useGamifiedActions`
**File**: `src/hooks/useGamifiedActions.tsx`

**Purpose**: Unified hook for triggering gamified actions that award XP and update achievements.

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `handleSwipe` | `function` | Track swipe action |
| `handleSuperLike` | `function` | Track super like action |
| `handleMatch` | `function` | Track match action |
| `handleMessage` | `function` | Track message action |
| `handleFollow` | `function` | Track follow action |
| `handleAction` | `(type: string, amount?: number) => void` | Generic action handler |

**Use Cases**:
- Wrapping user actions with gamification
- XP awarding
- Achievement progress updates

---

## Discovery & Matching

### `useDiscoverUsers`
**File**: `src/hooks/useDiscoverUsers.tsx`

**Purpose**: Fetches and transforms user profiles for the discovery/swipe interface.

**Interface**:
```typescript
interface DiscoverUser {
  id: number;
  user_id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  interests: string[];
  distance: string;
  location?: string;
  gender?: string;
  user_type?: 'creator' | 'consumer';
  verification_status?: 'verified' | 'pending' | 'rejected';
  subscriber_count?: number;
  last_active?: string;
  subscriptionFee?: number;
  follower_count?: number;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `users` | `DiscoverUser[]` | Users for discovery |
| `loading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `refetch` | `function` | Refresh users |

**Features**:
- UUID validation for user IDs
- Excludes current user
- Transforms database fields to UI format

**Use Cases**:
- Swipe card stack
- Discovery feed
- User profiles

---

### `useLikes`
**File**: `src/hooks/useLikes.tsx`

**Purpose**: Manages like/super-like functionality with debouncing and retry logic.

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `createLike` | `(recipientId: string, isSuperLike?: boolean) => Promise<boolean>` | Send a like |
| `checkMutualLike` | `(recipientId: string) => Promise<boolean>` | Check for match |
| `checkExistingMatch` | `(recipientId: string) => Promise<boolean>` | Check existing match |
| `loading` | `boolean` | Loading state |

**Features**:
- 300ms debounce on rapid like attempts
- Automatic retry on network errors (up to 2 retries)
- UUID validation
- Duplicate prevention
- Handles pending/accepted/rejected statuses

**Use Cases**:
- Swipe actions
- Like button interactions
- Match detection

---

### `useIncomingLikes`
**File**: `src/hooks/useIncomingLikes.tsx`

**Purpose**: Manages incoming likes that users can accept or reject.

**Interface**:
```typescript
interface IncomingLike {
  like_id: string;
  sender_id: string;
  sender_name: string;
  sender_age: number;
  sender_bio?: string;
  sender_avatar_url?: string;
  sender_interests: string[];
  sender_location_city: string;
  sender_location_state: string;
  sender_user_type: 'creator' | 'consumer';
  sender_verification_status: string;
  is_super_like: boolean;
  created_at: string;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `incomingLikes` | `IncomingLike[]` | Pending likes |
| `loading` | `boolean` | Loading state |
| `processing` | `string \| null` | ID of like being processed |
| `acceptLike` | `(likeId: string) => Promise<boolean>` | Accept a like |
| `rejectLike` | `(likeId: string) => Promise<boolean>` | Reject a like |
| `refetch` | `function` | Refresh likes |
| `count` | `number` | Total pending likes |

**Features**:
- Real-time subscription for new likes
- Emits custom 'newMatch' event on acceptance
- Prevents rapid clicking during processing

**Use Cases**:
- Incoming likes page
- Like notification badges
- Match creation flow

---

### `useMatches`
**File**: `src/hooks/useMatches.tsx`

**Purpose**: Manages matched users and their conversation data.

**Interface**:
```typescript
interface Match {
  id: string;
  user_id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  interests: string[];
  distance: string;
  location?: string;
  gender?: string;
  user_type?: 'creator' | 'consumer';
  verification_status?: 'verified' | 'pending' | 'rejected';
  last_active?: string;
  conversation_id?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `matches` | `Match[]` | User's matches |
| `loading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `refetch` | `function` | Refresh matches |
| `retryCount` | `number` | Number of retry attempts |

**Features**:
- Real-time subscription for match updates
- Listens for custom 'newMatch' events
- Exponential backoff retry (up to 3 attempts)
- Includes conversation data

**Use Cases**:
- Matches list
- Chat initiation
- Match notifications

---

## Messaging & Conversations

### `useConversations`
**File**: `src/hooks/useConversations.tsx`

**Purpose**: Manages conversation list with real-time updates.

**Interface**:
```typescript
interface Conversation {
  conversation_id: string;
  match_id: string;
  other_user_id: string;
  other_name: string;
  other_avatar_url: string;
  last_message_content: string;
  last_message_at: string;
  unread_count: number;
  is_online: boolean;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `conversations` | `Conversation[]` | User's conversations |
| `loading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `refetch` | `function` | Refresh conversations |
| `markAsRead` | `(conversationId: string) => void` | Mark messages read |

**Features**:
- Real-time subscription for messages and matches
- 1 second debounce on updates
- Online status calculation (5 minute threshold)

**Use Cases**:
- Messages list
- Unread badges
- Online indicators

---

### `useMessages`
**File**: `src/hooks/useMessages.tsx`

**Purpose**: Manages individual conversation messages.

**Interface**:
```typescript
interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  sender_id: string;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `messages` | `Message[]` | Conversation messages |
| `loading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `sendMessage` | `(content: string) => Promise<boolean>` | Send a message |
| `refetch` | `function` | Refresh messages |

**Features**:
- Real-time subscription for new messages
- Optimistic UI updates
- Automatic sender detection

**Use Cases**:
- Chat interface
- Message history
- Real-time chat

---

### `useEnhancedMessages`
**File**: `src/hooks/useEnhancedMessages.tsx`

**Purpose**: Extended messaging with typing indicators and read receipts.

**Interface**:
```typescript
interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  read_at?: string;
  message_type: string;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `messages` | `Message[]` | Messages array |
| `loading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `sendMessage` | `(content: string) => Promise<boolean>` | Send message |
| `isTyping` | `boolean` | Typing indicator state |
| `updateTypingStatus` | `(typing: boolean) => void` | Update typing status |
| `refetch` | `function` | Refresh messages |

**Use Cases**:
- Enhanced chat with typing indicators
- Read receipt tracking
- Rich messaging

---

### `useChatPPV`
**File**: `src/hooks/useChatPPV.tsx`

**Purpose**: Manages pay-per-view media content within chats.

**Interface**:
```typescript
interface ChatMediaOffer {
  id: string;
  message_id: string;
  conversation_id: string;
  seller_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url?: string;
  price_keys: number;
  unlock_duration_hours?: number;
  caption?: string;
  is_active: boolean;
  created_at: string;
}

interface ChatMediaPurchase {
  id: string;
  offer_id: string;
  buyer_id: string;
  price_paid: number;
  purchased_at: string;
  expires_at?: string;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `loading` | `boolean` | Loading state |
| `createOffer` | `function` | Create PPV offer |
| `purchaseMedia` | `(offerId: string) => Promise` | Purchase content |
| `checkAccess` | `(offerId: string) => Promise<boolean>` | Check access |
| `uploadMedia` | `(file: File, conversationId: string) => Promise` | Upload media |
| `getOffersByConversation` | `(conversationId: string) => Promise` | Get offers |

**Use Cases**:
- Sending locked media in chat
- Purchasing exclusive content
- Content access management

---

### `useLockedChats`
**File**: `src/hooks/useLockedChats.ts`

**Purpose**: Manages PIN-protected chat conversations (local storage).

**Interface**:
```typescript
interface LockedChat {
  conversationId: string;
  pinHash: string;
  lockedAt: string;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `lockedChats` | `LockedChat[]` | Locked chats list |
| `isLocked` | `(conversationId: string) => boolean` | Check if locked |
| `lockChat` | `(conversationId: string, pin: string) => Result` | Lock a chat |
| `unlockChat` | `(conversationId: string, pin: string) => Result` | Unlock a chat |
| `verifyPin` | `(conversationId: string, pin: string) => boolean` | Verify PIN |

**Use Cases**:
- Private chat protection
- PIN-based access control

---

## Monetization & Payments

### `useWallet`
**File**: `src/hooks/useWallet.tsx`

**Purpose**: Manages user wallet for Keys (in-app currency).

**Interface**:
```typescript
interface Wallet {
  id: string;
  user_id: string;
  keys_balance: number;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `wallet` | `Wallet \| null` | User's wallet |
| `loading` | `boolean` | Loading state |
| `purchaseKeys` | `(amount: number) => Promise` | Buy Keys |
| `sendTip` | `(recipientUserId: string, amount: number, message?: string) => Promise` | Send tip |
| `refetch` | `function` | Refresh wallet |

**Use Cases**:
- Wallet balance display
- Key purchases
- Tipping creators

---

### `useEarnings`
**File**: `src/hooks/useEarnings.tsx`

**Purpose**: Tracks creator earnings from various sources.

**Interface**:
```typescript
interface Earning {
  id: string;
  user_id: string;
  source_type: 'subscription' | 'tip' | 'bonus';
  source_id?: string;
  amount: number;
  description?: string;
  created_at: string;
}

interface EarningsSummary {
  total: number;
  subscription_earnings: number;
  tip_earnings: number;
  bonus_earnings: number;
  recent_earnings: Earning[];
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `earnings` | `Earning[]` | All earnings |
| `summary` | `EarningsSummary \| null` | Earnings summary |
| `loading` | `boolean` | Loading state |
| `fetchEarnings` | `function` | Refresh earnings |
| `recordEarning` | `function` | Record new earning |

**Use Cases**:
- Earnings dashboard
- Revenue breakdown
- Financial history

---

### `useWithdrawals`
**File**: `src/hooks/useWithdrawals.tsx`

**Purpose**: Manages withdrawal requests and history.

**Constants**:
```typescript
MINIMUM_WITHDRAWAL = 5000; // Minimum withdrawal in Keys
WITHDRAWAL_FEE_PERCENTAGE = 5; // 5% fee
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `loading` | `boolean` | Loading state |
| `withdrawalsLoading` | `boolean` | Withdrawals fetch loading |
| `requestWithdrawal` | `function` | Submit withdrawal request |
| `fetchWithdrawals` | `function` | Get withdrawal history |
| `getTotalEarnings` | `function` | Get total earnings |
| `getAvailableBalance` | `function` | Get available balance |
| `getPendingWithdrawals` | `function` | Get pending withdrawal sum |
| `calculateWithdrawalFee` | `(amount: number) => number` | Calculate fee |
| `calculateNetAmount` | `(amount: number) => number` | Calculate net after fee |
| `convertKeysToNaira` | `(keys: number) => number` | Currency conversion |

**Use Cases**:
- Withdrawal requests
- Fee calculation
- Withdrawal history

---

### `useSubscriptionPlans`
**File**: `src/hooks/useSubscriptionPlans.tsx`

**Purpose**: Manages creator subscription plan CRUD operations.

**Interface**:
```typescript
interface SubscriptionPlan {
  id: string;
  creator_id: string;
  name: string;
  duration_days: number;
  price_keys: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `plans` | `SubscriptionPlan[]` | Creator's plans |
| `loading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `fetchCreatorPlans` | `(creatorId: string) => Promise` | Get creator's plans |
| `fetchMyPlans` | `function` | Get own plans |
| `createPlan` | `function` | Create new plan |
| `updatePlan` | `function` | Update plan |
| `deletePlan` | `function` | Deactivate plan |
| `clearError` | `function` | Clear error state |

**Use Cases**:
- Plan management for creators
- Plan display for subscribers
- Subscription tier selection

---

### `useSubscriptions`
**File**: `src/hooks/useSubscriptions.tsx`

**Purpose**: Manages subscription purchases and status checks.

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `subscribeToCreator` | `(creatorId: string, planId: string) => Promise` | Subscribe |
| `unsubscribeFromCreator` | `(creatorId: string) => Promise` | Unsubscribe |
| `isSubscribed` | `(creatorId: string) => Promise<boolean>` | Check status |
| `getUserSubscriptions` | `function` | Get all subscriptions |
| `getSubscriptionCount` | `(creatorId: string) => Promise<number>` | Get subscriber count |
| `loading` | `boolean` | Loading state |

**Features**:
- Balance validation before purchase
- Wallet updates for both parties
- Earnings recording
- Expiry date calculation

**Use Cases**:
- Subscription purchases
- Subscriber management
- Content access control

---

### `useReferrals`
**File**: `src/hooks/useReferrals.tsx`

**Purpose**: Manages referral program including codes, tracking, and rewards.

**Interface**:
```typescript
interface ReferralCode {
  id: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  referral_earnings: number;
}

interface ReferralRecord {
  id: string;
  referral_code: string;
  status: string;
  reward_amount: number;
  referee_reward_amount: number;
  created_at: string;
  completed_at: string | null;
  referee_profile?: {
    name: string;
    user_type: string;
  } | null;
}
```

**Reward Structure**:
| Referrer Type | Referee Type | Reward (Keys) |
|---------------|--------------|---------------|
| Creator | Creator | 150 |
| Creator | Consumer | 75 |
| Consumer | Creator | 100 |
| Consumer | Consumer | 50 |

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `referralCode` | `ReferralCode \| null` | User's referral code |
| `referralStats` | `ReferralStats \| null` | Referral statistics |
| `referralHistory` | `ReferralRecord[]` | Referral history |
| `loading` | `boolean` | Loading state |
| `shareReferral` | `(platform: string) => void` | Share referral link |
| `generateReferralLink` | `(code: string) => string` | Generate link |
| `getRewardAmount` | `function` | Calculate reward |
| `refetch` | `function` | Refresh data |

**Use Cases**:
- Referral dashboard
- Share functionality
- Reward tracking

---

## Content & Posts

### `usePostAccess`
**File**: `src/hooks/usePostAccess.tsx`

**Purpose**: Checks and manages access to exclusive/PPV posts.

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `hasAccess` | `boolean` | Whether user has access |
| `loading` | `boolean` | Loading state |
| `purchaseInfo` | `{ expires_at?: string; price_paid?: number } \| null` | Purchase details |
| `refetch` | `function` | Refresh access status |

**Use Cases**:
- Content gating
- PPV unlock status
- Subscription access checks

---

### `usePostLikes`
**File**: `src/hooks/usePostLikes.tsx`

**Purpose**: Manages likes on exclusive posts.

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `likes` | `any[]` | Post likes |
| `likeCount` | `number` | Total likes |
| `isLiked` | `boolean` | Current user's like status |
| `loading` | `boolean` | Loading state |
| `toggleLike` | `function` | Like/unlike post |
| `refetch` | `function` | Refresh data |

**Use Cases**:
- Like buttons on posts
- Like counts display

---

### `usePostComments`
**File**: `src/hooks/usePostComments.tsx`

**Purpose**: Manages comments on exclusive posts.

**Interface**:
```typescript
interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    avatar_url?: string;
  } | null;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `comments` | `Comment[]` | Post comments |
| `loading` | `boolean` | Loading state |
| `submitting` | `boolean` | Submit loading state |
| `addComment` | `(content: string) => Promise<boolean>` | Add comment |
| `deleteComment` | `(commentId: string) => Promise<boolean>` | Delete comment |
| `refetch` | `function` | Refresh comments |

**Use Cases**:
- Comments section
- Comment submission
- Comment moderation

---

### `usePostCommentCount`
**File**: `src/hooks/usePostCommentCount.tsx`

**Purpose**: Fetches comment count for a post (optimized for lists).

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `commentCount` | `number` | Total comments |
| `loading` | `boolean` | Loading state |
| `refetch` | `function` | Refresh count |

**Use Cases**:
- Comment count badges
- Feed statistics

---

## Social Features

### `useFollows`
**File**: `src/hooks/useFollows.tsx`

**Purpose**: Manages follow/unfollow relationships between users.

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `followUser` | `(followingId: string) => Promise` | Follow a user |
| `unfollowUser` | `(followingId: string) => Promise` | Unfollow a user |
| `isFollowing` | `(followingId: string) => Promise<boolean>` | Check follow status |
| `getFollowers` | `(userId: string) => Promise` | Get followers list |
| `getFollowing` | `(userId: string) => Promise` | Get following list |
| `getFollowCounts` | `(userId: string) => Promise` | Get follower/following counts |
| `followCounts` | `Record<string, { followers: number, following: number }>` | Cached counts |
| `loading` | `boolean` | Loading state |

**Features**:
- Self-follow prevention
- Duplicate follow prevention
- Cached follow counts

**Use Cases**:
- Follow buttons
- Follower/following lists
- Profile stats

---

### `useCreatorConsent`
**File**: `src/hooks/useCreatorConsent.tsx`

**Purpose**: Manages creator verification consent forms.

**Interface**:
```typescript
interface ConsentData {
  kycConsent: boolean;
  ageConsent: boolean;
  privacyConsent: boolean;
  finalAgreement: boolean;
}

interface ConsentRecord extends ConsentData {
  id: string;
  userId: string;
  consentCompletedAt?: string;
  termsVersion: string;
  createdAt: string;
  updatedAt: string;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `consentRecord` | `ConsentRecord \| null` | User's consent data |
| `loading` | `boolean` | Loading state |
| `createOrUpdateConsent` | `(data: ConsentData) => Promise` | Save consent |
| `isConsentComplete` | `() => boolean` | Check completion |
| `refetch` | `function` | Refresh data |

**Features**:
- IP address and user agent tracking for compliance
- Terms version tracking

**Use Cases**:
- Creator onboarding
- Age verification
- KYC consent flow

---

### `useCreatorWaitlist`
**File**: `src/hooks/useCreatorWaitlist.tsx`

**Purpose**: Manages creator application and waitlist system.

**Interface**:
```typescript
interface WaitlistApplication {
  email: string;
  fullName: string;
  phoneNumber?: string;
  locationCity?: string;
  locationState?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  otherSocial?: string;
  creatorCategory: string;
  currentFollowers: number;
  contentDescription?: string;
  whyJoin?: string;
  contentStrategy?: string;
  expectedMonthlyRevenue?: number;
  profilePhotoUrl?: string;
  portfolioUrls?: string[];
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `submitApplication` | `(application) => Promise` | Submit application |
| `checkStatus` | `(email: string) => Promise` | Check application status |
| `uploadFile` | `(file: File, folder: string) => Promise<string \| null>` | Upload documents |
| `loading` | `boolean` | Loading state |
| `uploading` | `boolean` | Upload loading state |

**Use Cases**:
- Creator application form
- Status checking
- Document uploads

---

## Notifications & Presence

### `useNotifications`
**File**: `src/hooks/useNotifications.tsx`

**Purpose**: Manages in-app notifications with real-time updates.

**Interface**:
```typescript
interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `notifications` | `Notification[]` | User's notifications |
| `unreadCount` | `number` | Unread notification count |
| `loading` | `boolean` | Loading state |
| `markAsRead` | `(notificationId: string) => void` | Mark single as read |
| `markAllAsRead` | `function` | Mark all as read |
| `refetch` | `function` | Refresh notifications |

**Features**:
- Real-time subscription for new notifications
- Auto-updates on changes

**Use Cases**:
- Notification bell
- Notification dropdown
- Notification page

---

### `useUserPresence`
**File**: `src/hooks/useUserPresence.tsx`

**Purpose**: Tracks and displays user online/offline status.

**Interface**:
```typescript
interface UserStatus {
  isOnline: boolean;
  lastSeen: string | null;
  statusText: string;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `updatePresence` | `(isOnline?: boolean) => void` | Update own status |
| `getUserStatus` | `(userId: string) => Promise<UserStatus>` | Get user's status |
| `userStatuses` | `Record<string, UserStatus>` | Cached statuses |
| `setUserStatuses` | `function` | Update status cache |

**Features**:
- 30-second heartbeat interval
- Visibility change detection
- Before unload cleanup
- Real-time presence subscription

**Use Cases**:
- Online/offline indicators
- Last seen timestamps
- Active now status

---

## Admin & Analytics

### `useRevenueAnalytics`
**File**: `src/hooks/useRevenueAnalytics.tsx`

**Purpose**: Fetches platform-wide revenue analytics for admin dashboard.

**Interface**:
```typescript
interface RevenueBreakdown {
  source_type: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

interface TopEarner {
  user_id: string;
  creator_name: string;
  avatar_url: string | null;
  user_type: string;
  total_earnings: number;
  tips_earnings: number;
  subscription_earnings: number;
  ppv_earnings: number;
}

interface MonthlyRevenue {
  month_date: string;
  month_label: string;
  total_revenue: number;
  tips: number;
  subscriptions: number;
  ppv: number;
}
```

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `revenueBreakdown` | `RevenueBreakdown[]` | Revenue by source |
| `monthlyTrend` | `MonthlyRevenue[]` | Monthly revenue trend |
| `topEarners` | `TopEarner[]` | Top earning creators |
| `totalRevenue` | `number` | Total platform revenue |
| `loading` | `boolean` | Loading state |
| `refetch` | `function` | Refresh data |

**Use Cases**:
- Admin revenue dashboard
- Revenue charts
- Top earners leaderboard

---

### `useEngagementMetrics`
**File**: `src/hooks/useEngagementMetrics.tsx`

**Purpose**: Fetches platform engagement metrics for admin analytics.

**Interface**:
```typescript
interface EngagementMetrics {
  total_users: number;
  active_users: number;
  engagement_rate: number;
  total_posts: number;
  total_likes: number;
  total_comments: number;
  total_matches: number;
  avg_posts_per_user: number;
}
```

**Parameters**:
- `periodDays` (default: 30): Number of days to analyze

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `metrics` | `EngagementMetrics \| null` | Engagement data |
| `loading` | `boolean` | Loading state |
| `refetch` | `function` | Refresh data |

**Use Cases**:
- Admin dashboard metrics
- Engagement reports
- Platform health monitoring

---

## Utility Hooks

### `use-mobile`
**File**: `src/hooks/use-mobile.tsx`

**Purpose**: Detects mobile viewport for responsive design.

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `isMobile` | `boolean` | Whether viewport is mobile |

**Breakpoint**: 768px

---

### `use-toast`
**File**: `src/hooks/use-toast.ts`

**Purpose**: Toast notification management (from shadcn/ui).

**Returns**: Standard toast API with `toast()` function for displaying notifications.

---

## Dependencies & Integration

### External Dependencies
```json
{
  "@supabase/supabase-js": "^2.50.0",
  "@tanstack/react-query": "^5.56.2",
  "react": "^18.3.1",
  "sonner": "^1.5.0"
}
```

### Supabase RPC Functions Used
- `handle_user_action` - Gamified action handling
- `check_and_award_achievements` - Achievement checking
- `update_user_streak` - Streak updates
- `add_user_experience` - XP addition
- `get_daily_stats` - Daily statistics
- `get_user_matches` - Match data
- `get_incoming_likes` - Pending likes
- `respond_to_like` - Like response
- `get_engagement_metrics` - Platform metrics
- `get_revenue_analytics` - Revenue data
- `get_monthly_revenue_trend` - Revenue trends
- `get_top_earners` - Top earners
- `update_user_presence` - Presence tracking
- `get_user_status` - User status
- `get_user_roles` - User roles
- `set_withdrawal_pin` - PIN management
- `verify_withdrawal_pin` - PIN verification
- `has_post_access` - Post access check
- `ensure_referral_code` - Referral code
- `mark_messages_as_read` - Read receipts
- `purchase_chat_media` - PPV purchase
- `has_chat_media_access` - PPV access check
- `get_waitlist_status` - Waitlist status

---

## Best Practices

### 1. Error Handling
All hooks implement consistent error handling:
```typescript
try {
  // Operation
} catch (error) {
  console.error('Error description:', error);
  toast.error('User-friendly message');
} finally {
  setLoading(false);
}
```

### 2. Loading States
Every hook exposes a `loading` boolean for UI feedback.

### 3. Real-time Subscriptions
Cleanup pattern for subscriptions:
```typescript
useEffect(() => {
  const channel = supabase.channel('channel-name')
    .on('postgres_changes', {...}, handler)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [dependencies]);
```

### 4. Debouncing
Rate-limiting for expensive operations:
```typescript
let debounceTimer: NodeJS.Timeout;
debounceTimer = setTimeout(() => {
  // Expensive operation
}, 1000);
```

### 5. Optimistic Updates
Update local state immediately, then sync:
```typescript
// Update local state first
setData(newData);
// Then sync with backend
await supabase.from('table').update(newData);
```

### 6. Type Safety
All hooks use TypeScript interfaces for data structures.

### 7. Refetch Pattern
Most hooks expose a `refetch` function for manual refresh.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024 | Initial documentation |

---

*This document is auto-generated from the Hook application codebase.*
