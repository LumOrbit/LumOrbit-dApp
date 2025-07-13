// Stellar SDK integration for StellarRemit
// This file contains utilities for Stellar blockchain operations

import { Keypair, Server, TransactionBuilder, Networks, Operation, Asset, Memo } from 'stellar-sdk';

// Stellar network configuration
const STELLAR_NETWORK = Networks.TESTNET; // Use MAINNET for production
const STELLAR_SERVER = new Server('https://horizon-testnet.stellar.org'); // Use https://horizon.stellar.org for mainnet

export interface StellarWallet {
  publicKey: string;
  secretKey: string;
}

export interface TransferParams {
  fromSecret: string;
  toPublicKey: string;
  amount: string;
  memo?: string;
  assetCode?: string;
  assetIssuer?: string;
}

/**
 * Generate a new Stellar keypair
 */
export function generateStellarWallet(): StellarWallet {
  const keypair = Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
}

/**
 * Get account balance for a Stellar address
 */
export async function getAccountBalance(publicKey: string): Promise<number> {
  try {
    const account = await STELLAR_SERVER.loadAccount(publicKey);
    const xlmBalance = account.balances.find(balance => balance.asset_type === 'native');
    return xlmBalance ? parseFloat(xlmBalance.balance) : 0;
  } catch (error) {
    console.error('Error fetching account balance:', error);
    throw new Error('Failed to fetch account balance');
  }
}

/**
 * Create and fund a new Stellar account (testnet only)
 */
export async function createAndFundAccount(publicKey: string): Promise<boolean> {
  try {
    // This only works on testnet - for mainnet, accounts need to be funded manually
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    return response.ok;
  } catch (error) {
    console.error('Error creating account:', error);
    return false;
  }
}

/**
 * Send XLM payment on Stellar network
 */
export async function sendStellarPayment(params: TransferParams): Promise<string> {
  try {
    const sourceKeypair = Keypair.fromSecret(params.fromSecret);
    const sourceAccount = await STELLAR_SERVER.loadAccount(sourceKeypair.publicKey());

    // Build the transaction
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: await STELLAR_SERVER.fetchBaseFee(),
      networkPassphrase: STELLAR_NETWORK,
    });

    // Add payment operation
    const asset = params.assetCode && params.assetIssuer 
      ? new Asset(params.assetCode, params.assetIssuer)
      : Asset.native();

    transaction.addOperation(
      Operation.payment({
        destination: params.toPublicKey,
        asset: asset,
        amount: params.amount,
      })
    );

    // Add memo if provided
    if (params.memo) {
      transaction.addMemo(Memo.text(params.memo));
    }

    // Set timeout and build
    transaction.setTimeout(30);
    const builtTransaction = transaction.build();

    // Sign the transaction
    builtTransaction.sign(sourceKeypair);

    // Submit to the network
    const result = await STELLAR_SERVER.submitTransaction(builtTransaction);
    return result.hash;
  } catch (error) {
    console.error('Error sending Stellar payment:', error);
    throw new Error('Failed to send payment on Stellar network');
  }
}

/**
 * Get transaction details by hash
 */
export async function getTransactionDetails(transactionHash: string) {
  try {
    const transaction = await STELLAR_SERVER.transactions().transaction(transactionHash).call();
    return transaction;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw new Error('Failed to fetch transaction details');
  }
}

/**
 * Validate Stellar public key format
 */
export function isValidStellarPublicKey(publicKey: string): boolean {
  try {
    Keypair.fromPublicKey(publicKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate Stellar secret key format
 */
export function isValidStellarSecretKey(secretKey: string): boolean {
  try {
    Keypair.fromSecret(secretKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Encrypt private key for storage (basic implementation)
 * In production, use proper encryption with user-derived keys
 */
export function encryptPrivateKey(privateKey: string, password: string): string {
  // This is a basic implementation - use proper encryption in production
  // Consider using libraries like crypto-js or native crypto APIs
  return btoa(privateKey + ':' + password);
}

/**
 * Decrypt private key from storage (basic implementation)
 */
export function decryptPrivateKey(encryptedKey: string, password: string): string {
  try {
    const decoded = atob(encryptedKey);
    const [privateKey, storedPassword] = decoded.split(':');
    if (storedPassword !== password) {
      throw new Error('Invalid password');
    }
    return privateKey;
  } catch {
    throw new Error('Failed to decrypt private key');
  }
}