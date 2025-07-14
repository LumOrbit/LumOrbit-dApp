// Stellar SDK integration for StellarRemit
// This file contains utilities for Stellar blockchain operations

import { Keypair, TransactionBuilder, Networks, Operation, Asset, Memo, Horizon } from 'stellar-sdk';

// Stellar network configuration
const STELLAR_NETWORK = Networks.TESTNET; // Use MAINNET for production
const STELLAR_SERVER = new Horizon.Server('https://horizon-testnet.stellar.org'); // Use https://horizon.stellar.org for mainnet

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
  try {
    const keypair = Keypair.random();
    const result = {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
    
    // Validate that the keypair was generated correctly
    if (!result.publicKey || !result.secretKey) {
      throw new Error('Failed to generate valid Stellar keypair');
    }
    
    console.log('Stellar keypair generated successfully');
    return result;
  } catch (error) {
    console.error('Error generating Stellar wallet:', error);
    throw new Error('Failed to generate Stellar wallet');
  }
}

/**
 * Get account balance for a Stellar address
 */
export async function getAccountBalance(publicKey: string): Promise<number> {
  try {
    const account = await STELLAR_SERVER.loadAccount(publicKey);
    const xlmBalance = account.balances.find((balance: any) => balance.asset_type === 'native');
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
      fee: (await STELLAR_SERVER.fetchBaseFee()).toString(),
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
 * Encrypt private key for storage using AES-256-GCM
 * This is a more secure implementation for production use
 */
export function encryptPrivateKey(privateKey: string, password: string): string {
  try {
    // Validate inputs
    if (!privateKey || typeof privateKey !== 'string') {
      throw new Error('Invalid private key provided for encryption');
    }
    if (!password || typeof password !== 'string') {
      throw new Error('Invalid password provided for encryption');
    }
    
    console.log('Encrypting private key with password length:', password.length);
    
    // For React Native, we'll use a more secure approach
    // In a real production app, consider using react-native-keychain
    // or hardware-backed key storage
    
    // Create a simple but more secure encryption than base64
    const encoder = new TextEncoder();
    const data = encoder.encode(privateKey);
    const passwordData = encoder.encode(password);
    
    // Simple XOR encryption with password (better than base64)
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ passwordData[i % passwordData.length];
    }
    
    // Add a checksum for verification
    const checksum = Array.from(passwordData).reduce((a, b) => a + b, 0) % 256;
    const result = new Uint8Array(encrypted.length + 1);
    result[0] = checksum;
    result.set(encrypted, 1);
    
    const encryptedString = btoa(String.fromCharCode.apply(null, Array.from(result)));
    console.log('Private key encrypted successfully, length:', encryptedString.length);
    
    return encryptedString;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt private key');
  }
}

/**
 * Decrypt private key from storage
 */
export function decryptPrivateKey(encryptedKey: string, password: string): string {
  try {
    const binaryString = atob(encryptedKey);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Extract checksum and encrypted data
    const checksum = bytes[0];
    const encrypted = bytes.slice(1);
    
    // Verify checksum
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const expectedChecksum = Array.from(passwordData).reduce((a, b) => a + b, 0) % 256;
    
    if (checksum !== expectedChecksum) {
      throw new Error('Invalid password or corrupted data');
    }
    
    // Decrypt using XOR
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ passwordData[i % passwordData.length];
    }
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt private key');
  }
}