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

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd LumOrbit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Create a project on [Supabase](https://supabase.com/).
   - Copy the required environment variables and set up the database using the files in `/supabase/migrations`.

4. **Run the app in development mode:**
   ```bash
   npm run dev
   ```

5. **Build for web:**
   ```bash
   npm run build:web
   ```

## Contributing

Contributions are welcome! Please open an issue or pull request for suggestions, improvements, or bug reports.

## License

MIT
