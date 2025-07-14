import { useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { 
  generateStellarWallet, 
  createAndFundAccount, 
  getAccountBalance, 
  encryptPrivateKey, 
  decryptPrivateKey,
  isValidStellarPublicKey 
} from '@/lib/stellar';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WalletData {
  publicKey: string;
  walletAddress: string;
  balance: number;
  isActivated: boolean;
}

export function useStellarWallet() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add guards to prevent concurrent operations
  const isLoadingWalletData = useRef(false);
  const isCreatingWallet = useRef(false);
  const lastLoadedUserId = useRef<string | null>(null);

  /**
   * Create invisible wallet during user registration
   * This function generates a Stellar keypair and stores it securely
   */
  const createInvisibleWallet = async (userId: string, userEmail: string): Promise<{
    publicKey: string;
    walletAddress: string;
    encryptedPrivateKey: string;
  } | null> => {
    // Prevent concurrent wallet creation
    if (isCreatingWallet.current) {
      console.log('Wallet creation already in progress, skipping...');
      return null;
    }
    
    isCreatingWallet.current = true;
    
    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting wallet creation for user:', userId);

      // Generate a new Stellar keypair
      console.log('Generating Stellar wallet...');
      const wallet = generateStellarWallet();
      console.log('Stellar keypair generated successfully');
      
      // Create a secure password for encryption using user data
      console.log('Generating encryption password...');
      const encryptionPassword = await generateEncryptionPassword(userId, userEmail);
      console.log('Encryption password generated, length:', encryptionPassword.length);
      
      // Encrypt the private key for secure storage
      console.log('Encrypting private key...');
      const encryptedPrivateKey = encryptPrivateKey(wallet.secretKey, encryptionPassword);
      console.log('Private key encrypted successfully, length:', encryptedPrivateKey.length);
      
      // Store the encrypted private key locally for quick access
      console.log('Storing wallet data locally...');
      const walletStorageData = {
        encryptedPrivateKey,
        publicKey: wallet.publicKey,
        walletAddress: wallet.publicKey, // In Stellar, public key is the wallet address
        createdAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(
        `stellar_wallet_${userId}`, 
        JSON.stringify(walletStorageData)
      );
      console.log('Wallet data stored locally successfully');

      // Try to fund the account on testnet (for development) - non-blocking
      console.log('Attempting to fund account on testnet...');
      
      // Use a timeout to prevent hanging
      const fundingPromise = createAndFundAccount(wallet.publicKey);
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Funding timeout')), 5000); // 5 second timeout
      });

      try {
        const funded = await Promise.race([fundingPromise, timeoutPromise]);
        console.log('Account funding result:', funded);
      } catch (fundingError) {
        console.log('Account funding failed (expected in production):', fundingError);
        // Don't throw error here, as funding is optional
      }
      
      console.log('Proceeding with wallet creation regardless of funding result...');

      const result = {
        publicKey: wallet.publicKey,
        walletAddress: wallet.publicKey,
        encryptedPrivateKey
      };
      
      console.log('Wallet creation completed successfully:', {
        publicKey: result.publicKey,
        walletAddress: result.walletAddress,
        hasEncryptedKey: !!result.encryptedPrivateKey
      });

      return result;
    } catch (err) {
      console.error('Error creating invisible wallet:', err);
      const error = err as Error;
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setError(`Failed to create wallet: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
      isCreatingWallet.current = false;
    }
  };

  /**
   * Load wallet data for a user
   */
  const loadWalletData = async (user: User): Promise<void> => {
    // Prevent concurrent loading for the same user
    if (isLoadingWalletData.current || lastLoadedUserId.current === user.id) {
      console.log('Wallet data loading already in progress or recently completed for user:', user.id);
      return;
    }
    
    isLoadingWalletData.current = true;
    lastLoadedUserId.current = user.id;
    
    try {
      setIsLoading(true);
      setError(null);

      // Get wallet data from database with timeout
      const loadPromise = supabase
        .from('users')
        .select('public_key, wallet_address, private_key')
        .eq('id', user.id)
        .single();
        
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Load wallet data timeout')), 5000);
      });

      const { data: userData, error: dbError } = await Promise.race([
        loadPromise,
        timeoutPromise
      ]) as any;

      if (dbError) {
        throw dbError;
      }

      if (!userData?.public_key) {
        setWalletData(null);
        return;
      }

      // Get balance from Stellar network
      let balance = 0;
      let isActivated = false;

      try {
        balance = await getAccountBalance(userData.public_key);
        isActivated = balance > 0;
      } catch (balanceError) {
        console.log('Could not fetch balance (account may not be activated):', balanceError);
        // Account might not be activated yet, which is normal
      }

      setWalletData({
        publicKey: userData.public_key,
        walletAddress: userData.wallet_address || userData.public_key,
        balance,
        isActivated
      });
    } catch (err) {
      console.error('Error loading wallet data:', err);
      setError('Failed to load wallet data');
    } finally {
      setIsLoading(false);
      isLoadingWalletData.current = false;
      // Reset the last loaded user after a delay to allow re-loading if needed
      setTimeout(() => {
        if (lastLoadedUserId.current === user.id) {
          lastLoadedUserId.current = null;
        }
      }, 3000);
    }
  };

  /**
   * Get decrypted private key for transaction signing
   */
  const getPrivateKey = async (userId: string, userEmail: string): Promise<string | null> => {
    try {
      // First try to get from local storage
      const localData = await AsyncStorage.getItem(`stellar_wallet_${userId}`);
      if (localData) {
        const { encryptedPrivateKey } = JSON.parse(localData);
        const encryptionPassword = await generateEncryptionPassword(userId, userEmail);
        return decryptPrivateKey(encryptedPrivateKey, encryptionPassword);
      }

      // If not found locally, get from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('private_key')
        .eq('id', userId)
        .single();

      if (error || !userData?.private_key) {
        return null;
      }

      const encryptionPassword = await generateEncryptionPassword(userId, userEmail);
      return decryptPrivateKey(userData.private_key, encryptionPassword);
    } catch (err) {
      console.error('Error getting private key:', err);
      return null;
    }
  };

  /**
   * Refresh wallet balance
   */
  const refreshBalance = async (): Promise<void> => {
    if (!walletData?.publicKey) return;

    try {
      const balance = await getAccountBalance(walletData.publicKey);
      setWalletData(prev => prev ? { ...prev, balance, isActivated: balance > 0 } : null);
    } catch (err) {
      console.error('Error refreshing balance:', err);
    }
  };

  /**
   * Validate wallet address
   */
  const validateAddress = (address: string): boolean => {
    return isValidStellarPublicKey(address);
  };

  /**
   * Generate encryption password based on user data
   */
  const generateEncryptionPassword = async (userId: string, userEmail: string): Promise<string> => {
    // Create a deterministic password based on user data
    // In production, consider using a more sophisticated key derivation function
    const encoder = new TextEncoder();
    const data = encoder.encode(userId + userEmail + 'lumorbit_stellar_wallet');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  /**
   * Clear wallet data (for logout)
   */
  const clearWalletData = async (userId: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(`stellar_wallet_${userId}`);
      setWalletData(null);
      setError(null);
    } catch (err) {
      console.error('Error clearing wallet data:', err);
    }
  };

  return {
    walletData,
    isLoading,
    error,
    createInvisibleWallet,
    loadWalletData,
    getPrivateKey,
    refreshBalance,
    validateAddress,
    clearWalletData
  };
} 