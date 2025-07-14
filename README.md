# LumOrbit

**Low-cost cross-border remittances for migrants, powered by the Stellar ecosystem.**

## Description

LumOrbit is a platform that leverages the Stellar network to provide fast, secure, and low-cost international money transfers, especially designed for migrants and their families. It integrates local services and automates currency conversions using smart contracts, reducing remittance costs and improving financial inclusion.

## Key Features

- **Fast & Secure Transfers:** Send money worldwide using Stellar blockchain technology.
- **Low Fees:** Take advantage of Stellar's competitive rates to maximize the value received by recipients.
- **Automatic Currency Conversion:** Automated currency exchange and local delivery.
- **Integration with Local Services:** Delivery options such as bank transfers, cash pickup, and mobile wallets.
- **User & Recipient Management:** Create accounts, manage beneficiaries, and view transfer history.
- **Notifications & Tracking:** Get updates on your transfers and security notifications.
- **Security:** Secure private key storage and robust authentication.

## Tech Stack

- **React Native & Expo:** Cross-platform mobile interface.
- **Stellar SDK:** Blockchain operations and Stellar integration.
- **Supabase:** Backend-as-a-service for authentication, database, and real-time subscriptions.
- **TypeScript:** Static typing for reliability.
- **Others:** Expo Router, Lucide Icons, and more.

## Project Structure

- `/app`: Main screens and routes of the app.
- `/components`: Reusable UI components.
- `/hooks`: Custom hooks for business logic (auth, transfers, exchange rates).
- `/lib`: Stellar integration and utilities.
- `/supabase`: Database configuration and migrations.
- `/constants`, `/assets`: Additional resources and configuration.

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (installed globally)
- **Supabase account** (free tier available)

### Step-by-Step Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd LumOrbit-dApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   If you encounter dependency conflicts, use:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up Supabase:**
   - Create a new project on [Supabase](https://supabase.com/)
   - Navigate to **Settings** → **API** to get your project credentials
   - Copy the **Project URL** and **Anon Key**
   - Create a `.env.local` file in the project root:
     ```env
     EXPO_PUBLIC_SUPABASE_URL=your_project_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

4. **Initialize the database:**
   - In your Supabase dashboard, go to **SQL Editor**
   - Run the migrations from `supabase/migrations/` in chronological order:
     - `20250713004135_flat_leaf.sql`
     - `20250713004206_azure_cliff.sql`
     - `20250713194500_add_expansion_countries_fixed.sql`
     - `20250713194600_sync_auth_users.sql`

5. **Run the development server:**
   ```bash
   npx expo start
   ```
   
   Or with cache clearing:
   ```bash
   npx expo start --clear
   ```

6. **Access the app:**
   - **Mobile:** Scan the QR code with Expo Go app
   - **Web:** Press `w` in the terminal to open in browser
   - **iOS Simulator:** Press `i` (requires Xcode)
   - **Android Emulator:** Press `a` (requires Android Studio)

### Building for Production

1. **Web build:**
   ```bash
   npm run build:web
   ```

2. **Mobile build:**
   ```bash
   npx expo build:android
   npx expo build:ios
   ```

### Troubleshooting

- **Port conflicts:** Use `--port 8082` if port 8081 is occupied
- **Metro bundler issues:** Clear cache with `npx expo start --clear`
- **Dependency conflicts:** Use `npm install --legacy-peer-deps`
- **Database connection:** Verify your Supabase credentials in `.env.local`

## Exchange Rates

LumOrbit supports 16 countries with real-time exchange rate data. Current rates from USD:

### Latin America
| Currency | Country | Rate (USD) | 24h Change |
|----------|---------|------------|------------|
| COP | Colombia 🇨🇴 | 4,125.50 | -12.30 |
| MXN | Mexico 🇲🇽 | 18.45 | +0.25 |
| PEN | Peru 🇵🇪 | 3.75 | +0.02 |
| GTQ | Guatemala 🇬🇹 | 7.85 | +0.05 |
| HNL | Honduras 🇭🇳 | 24.65 | +0.08 |
| NIO | Nicaragua 🇳🇮 | 36.85 | +0.12 |
| VES | Venezuela 🇻🇪 | 36.20* | -2.15 |
| CUP | Cuba 🇨🇺 | 120.00 | 0.00 |
| USD | Ecuador 🇪🇨 | 1.00 | - |
| USD | El Salvador 🇸🇻 | 1.00 | - |

### Asia
| Currency | Country | Rate (USD) | 24h Change |
|----------|---------|------------|------------|
| INR | India 🇮🇳 | 83.12 | +0.42 |
| PHP | Philippines 🇵🇭 | 56.20 | -0.15 |
| BDT | Bangladesh 🇧🇩 | 110.50 | +0.12 |

### Africa
| Currency | Country | Rate (USD) | 24h Change |
|----------|---------|------------|------------|
| NGN | Nigeria 🇳🇬 | 1,540.00 | +0.85 |
| KES | Kenya 🇰🇪 | 129.50 | +0.42 |
| GHS | Ghana 🇬🇭 | 15.20 | +0.18 |

**Note:** *VES rate is scaled by 1000x for database constraints (36.20 = 36,200 VES per USD)*

**Total Coverage:** 16 countries across 3 continents with comprehensive remittance solutions.

## Market Analysis & Expansion Strategy

LumOrbit has expanded from 10 to 16 countries, strategically targeting high-impact markets based on remittance patterns and crypto adoption:

### 🌎 Latin America
Strong candidates due to high remittance dependency and migration patterns:

**🇻🇪 Venezuela**
- High emigration (over 7 million people abroad)
- Difficulty receiving money through traditional channels (capital controls, sanctioned banks)
- Growing familiarity with crypto (out of necessity)
- Integration opportunities with platforms like Reserve, Binance P2P, etc.

**🇨🇺 Cuba**
- Banking system isolated by sanctions
- Western Union stopped operating in 2020
- Many remittances enter as physical dollars or through alternative channels
- Crypto can be a key solution with local gateway integration (e.g., MLC - Moneda Libremente Convertible)

### 🌍 Africa
Emerging fintech markets with high crypto adoption:

**🇳🇬 Nigeria**
- One of the countries with highest crypto adoption globally
- Difficulty moving money between banks and platforms
- Young population seeking agile and digital solutions

**🇰🇪 Kenya & 🇬🇭 Ghana**
- Active fintech ecosystem
- Moderate banking penetration but high mobile money adoption
- Stable crypto (like USDC on Stellar) would be well-received for remittances

### 🌏 Asia
Major remittance corridors with growing crypto acceptance:

**🇧🇩 Bangladesh**
- Large number of migrants in Middle East sending money back
- High friction and costs in traditional services
- Significant opportunity for cost reduction through blockchain

### Current Coverage
LumOrbit currently supports: 
- **Latin America**: Colombia 🇨🇴, Ecuador 🇪🇨, El Salvador 🇸🇻, Guatemala 🇬🇹, Honduras 🇭🇳, Mexico 🇲🇽, Nicaragua 🇳🇮, Peru 🇵🇪, Venezuela 🇻🇪, Cuba 🇨🇺
- **Asia**: India 🇮🇳, Philippines 🇵🇭, Bangladesh 🇧🇩
- **Africa**: Nigeria 🇳🇬, Kenya 🇰🇪, Ghana 🇬🇭

**Total**: 16 countries with comprehensive remittance solutions.

## Contributing

Contributions are welcome! Please open an issue or pull request for suggestions, improvements, or bug reports.

## AI tools:
– Bolt for building a mockup
– Cursor for code
– ChatGPT Plus for the logo
– Claude for navigating the documentation

## License

MIT
