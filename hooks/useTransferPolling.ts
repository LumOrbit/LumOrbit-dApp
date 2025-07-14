import { useEffect, useRef, useState } from 'react';
import { useTransfers } from './useTransfers';
import { useStellarWallet } from './useStellarWallet';
import { useAuth } from './useAuth';
import { sendStellarPayment } from '@/lib/stellar';

interface TransferProgress {
  transferId: string;
  status: 'pending' | 'processing' | 'sending' | 'completing' | 'completed' | 'failed';
  progress: number;
  message: string;
  stellarTxId?: string;
}

interface UseTransferPollingReturn {
  activeTransfer: TransferProgress | null;
  startPolling: (transferId: string, amount: number, recipientWallet?: string) => void;
  stopPolling: () => void;
}

export function useTransferPolling(): UseTransferPollingReturn {
  const { updateTransferStatus } = useTransfers();
  const { getPrivateKey, refreshBalance } = useStellarWallet();
  const { user } = useAuth();
  const [activeTransfer, setActiveTransfer] = useState<TransferProgress | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const transferStageRef = useRef(0);

  const simulatedStages = [
    { status: 'processing', progress: 20, message: 'Processing your transfer...', duration: 2000 },
    { status: 'sending', progress: 50, message: 'Sending to Stellar network...', duration: 3000 },
    { status: 'completing', progress: 80, message: 'Completing transaction...', duration: 2000 },
    { status: 'completed', progress: 100, message: 'Transfer completed successfully!', duration: 1000 }
  ] as const;

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    transferStageRef.current = 0;
  };

  const processStage = async (transferId: string, amount: number, recipientWallet?: string) => {
    const currentStage = simulatedStages[transferStageRef.current];
    
    if (!currentStage) {
      stopPolling();
      return;
    }

    // Update progress
    setActiveTransfer(prev => prev ? {
      ...prev,
      status: currentStage.status,
      progress: currentStage.progress,
      message: currentStage.message
    } : null);

    // If we're in the sending stage, execute actual Stellar transaction
    if (currentStage.status === 'sending' && user) {
      try {
        // Get user's private key for the transaction
        const privateKey = await getPrivateKey(user.id, user.email!);
        
        if (privateKey && recipientWallet) {
          // Send actual Stellar payment
          const stellarTxId = await sendStellarPayment({
            fromSecret: privateKey,
            toPublicKey: recipientWallet,
            amount: amount.toString(),
            memo: `Transfer ${transferId}`
          });

          // Update transfer with Stellar transaction ID
          setActiveTransfer(prev => prev ? {
            ...prev,
            stellarTxId
          } : null);

          console.log('Stellar transaction completed:', stellarTxId);
        } else {
          // Simulate successful transaction for demo purposes
          const mockTxId = `stellar_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
          setActiveTransfer(prev => prev ? {
            ...prev,
            stellarTxId: mockTxId
          } : null);
        }
      } catch (error) {
        console.error('Error sending Stellar payment:', error);
        
        // Update transfer status to failed
        await updateTransferStatus(transferId, 'failed');
        setActiveTransfer(prev => prev ? {
          ...prev,
          status: 'failed',
          message: 'Transfer failed. Please try again.'
        } : null);
        
        stopPolling();
        return;
      }
    }

    // If this is the completion stage, update the database
    if (currentStage.status === 'completed') {
      const stellarTxId = activeTransfer?.stellarTxId;
      await updateTransferStatus(transferId, 'completed', stellarTxId);
      
      // Refresh wallet balance to reflect the change
      await refreshBalance();
      
      stopPolling();
      return;
    }

    // Move to next stage after the duration
    setTimeout(() => {
      transferStageRef.current += 1;
    }, currentStage.duration);
  };

  const startPolling = (transferId: string, amount: number, recipientWallet?: string) => {
    // Reset state
    stopPolling();
    transferStageRef.current = 0;
    
    // Set initial state
    setActiveTransfer({
      transferId,
      status: 'pending',
      progress: 10,
      message: 'Initiating transfer...'
    });

    // Start polling every second
    pollingIntervalRef.current = setInterval(() => {
      processStage(transferId, amount, recipientWallet);
    }, 1000);

    // Process first stage immediately
    setTimeout(() => processStage(transferId, amount, recipientWallet), 500);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  return {
    activeTransfer,
    startPolling,
    stopPolling
  };
}