/**
 * LumOrbit CRUD Operations Overview
 * 
 * This file provides a comprehensive overview of all CRUD (Create, Read, Update, Delete) 
 * operations available in the LumOrbit remittance application.
 * 
 * Database Tables:
 * - users: User profiles with Stellar wallet information
 * - recipients: Transfer recipients managed by users
 * - transfers: Transaction records and history
 * - exchange_rates: Real-time currency exchange rates
 * - countries: Supported countries with delivery methods
 * - notifications: User notifications with real-time updates
 */

// Re-export all CRUD hooks for easy access
export { useAuth } from '@/hooks/useAuth';
export { useUserProfile } from '@/hooks/useUserProfile';
export { useRecipients } from '@/hooks/useRecipients';
export { useTransfers } from '@/hooks/useTransfers';
export { useExchangeRates, createExchangeRate, updateExchangeRate, updateExchangeRateByCurrency, deleteExchangeRate, batchUpdateExchangeRates } from '@/hooks/useExchangeRates';
export { useCountries } from '@/hooks/useCountries';
export { useNotifications, createTransferNotification, createSecurityNotification, createPromotionNotification, createSystemNotification } from '@/hooks/useNotifications';

/**
 * CRUD Operations Summary:
 * 
 * 1. USERS (useAuth, useUserProfile)
 *    ✅ Create: Sign up with wallet creation
 *    ✅ Read: Get user profile and auth state
 *    ✅ Update: Update profile, wallet info, verification status
 *    ✅ Delete: Delete user profile
 *    🔧 Additional: Wallet management, verification checks
 * 
 * 2. RECIPIENTS (useRecipients)
 *    ✅ Create: Add new recipients
 *    ✅ Read: Get user's recipients list
 *    ✅ Update: Modify recipient information
 *    ✅ Delete: Remove recipients
 *    🔧 Additional: Favorite management, filtering
 * 
 * 3. TRANSFERS (useTransfers)
 *    ✅ Create: Initiate new transfers
 *    ✅ Read: Get transfer history
 *    ✅ Update: Update transfer details and status
 *    ✅ Delete: Remove transfers
 *    🔧 Additional: Status management, cancellation
 * 
 * 4. EXCHANGE_RATES (useExchangeRates)
 *    ✅ Create: Add new exchange rates
 *    ✅ Read: Get current rates with real-time updates
 *    ✅ Update: Update rates individually or in batch
 *    ✅ Delete: Remove exchange rates
 *    🔧 Additional: Currency conversion, rate calculations
 * 
 * 5. COUNTRIES (useCountries)
 *    ✅ Create: Add new supported countries
 *    ✅ Read: Get countries list
 *    ✅ Update: Modify country information and delivery methods
 *    ✅ Delete: Remove countries
 *    🔧 Additional: Support toggle, delivery method management
 * 
 * 6. NOTIFICATIONS (useNotifications)
 *    ✅ Create: Send notifications to users
 *    ✅ Read: Get notifications with real-time updates
 *    ✅ Update: Mark as read/unread
 *    ✅ Delete: Remove notifications
 *    🔧 Additional: Type filtering, bulk operations, utility functions
 */

/**
 * Real-time Features:
 * - Exchange rates: Live updates via Supabase real-time subscriptions
 * - Notifications: Instant notification delivery and status updates
 * - Transfer status: Real-time transfer status updates
 */

/**
 * Security Features:
 * - Row Level Security (RLS) enabled on all tables
 * - User-scoped data access (users can only access their own data)
 * - Encrypted private key storage for Stellar wallets
 * - Authentication required for all operations
 */

/**
 * Usage Examples:
 * 
 * // User Management
 * const { user, signUp, signIn, signOut } = useAuth();
 * const { profile, updateProfile, deleteProfile } = useUserProfile();
 * 
 * // Recipients Management
 * const { recipients, createRecipient, updateRecipient, deleteRecipient } = useRecipients();
 * 
 * // Transfers Management
 * const { transfers, createTransfer, updateTransfer, deleteTransfer } = useTransfers();
 * 
 * // Exchange Rates
 * const { rates, getRate, convertAmount } = useExchangeRates();
 * 
 * // Countries
 * const { countries, getSupportedCountries, getCountryByCode } = useCountries();
 * 
 * // Notifications
 * const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
 */

/**
 * Error Handling:
 * All CRUD operations return a consistent format:
 * - Success: { data: T, error: null }
 * - Error: { data: null, error: Error }
 * 
 * This allows for consistent error handling across the application.
 */ 