import React, { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import type { SolanaSignInInput } from '@solana/wallet-standard-features';
import { verifySignIn } from '@solana/wallet-standard-util';
import { useAuth } from '../context/AuthContext';
import { Shield, Wallet, Check, AlertCircle } from 'lucide-react';
import X402Logo from './X402Logo';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

const LoginPage: React.FC = () => {
  const { publicKey, signIn, connect, disconnect, wallet, connected } = useWallet();
  const { setAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle sign-in with SIWS
  const handleSignIn = useCallback(async () => {
    if (!wallet) {
      setError('Please select a wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Check if wallet supports Sign In With Solana
      if (signIn) {
        // Create sign-in input data
        const signInInput = await createSignInData();

        // Request sign-in from wallet
        const signInOutput = await signIn(signInInput);

        // Verify the signature
        // NOTE: In production, verification should be done server-side
        const verified = verifySignIn(signInInput, signInOutput);

        if (!verified) {
          throw new Error('Signature verification failed');
        }

        // Authentication successful
        setSuccess(true);
        const address = signInOutput.account.address;
        
        // Update auth context
        setTimeout(() => {
          setAuthenticated(true, address);
        }, 1000);

      } else {
        // Fallback: Use traditional connect + sign message flow
        if (!connected) {
          await connect();
        }

        if (!publicKey) {
          throw new Error('Wallet not connected');
        }

        // For wallets that don't support SIWS, just verify connection
        setSuccess(true);
        
        setTimeout(() => {
          setAuthenticated(true, publicKey.toBase58());
        }, 1000);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in. Please try again.';
      setError(errorMessage);
      await disconnect();
    } finally {
      setLoading(false);
    }
  }, [wallet, signIn, connect, disconnect, connected, publicKey, setAuthenticated]);

  // Only auto-trigger sign-in once when wallet first connects (not on every mount)
  const [hasAttemptedSignIn, setHasAttemptedSignIn] = useState(false);
  
  useEffect(() => {
    if (connected && wallet && !success && !loading && !hasAttemptedSignIn) {
      setHasAttemptedSignIn(true);
      handleSignIn();
    }
  }, [connected, wallet, success, loading, hasAttemptedSignIn, handleSignIn]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <X402Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold mb-2">X402 API Gateway</h1>
          <p className="text-gray-400">Sign in with your Solana wallet</p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          {/* Features */}
          <div className="mb-8 space-y-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-sm mb-1">Secure Authentication</h3>
                <p className="text-xs text-gray-400">
                  Sign in securely using your Solana wallet. No passwords required.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Wallet className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-sm mb-1">Wallet-Based Identity</h3>
                <p className="text-xs text-gray-400">
                  Your wallet address is your identity. Full control, no intermediaries.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-sm mb-1">No Blockchain Transaction</h3>
                <p className="text-xs text-gray-400">
                  This authentication doesn't trigger any transaction or cost gas fees.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-900 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-400 text-sm mb-1">Authentication Error</h4>
                <p className="text-xs text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-900 rounded-lg flex items-start space-x-3">
              <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-green-400 text-sm mb-1">Authentication Successful!</h4>
                <p className="text-xs text-green-300">Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          {/* Wallet Connect Button */}
          <div className="wallet-adapter-button-container">
            <WalletMultiButton 
              className="bg-white! text-black! hover:bg-gray-200! w-full! justify-center! rounded-lg! font-medium! py-3!"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <p className="text-sm text-gray-400 mt-2">Authenticating...</p>
            </div>
          )}

          {/* Info Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Don't have a Solana wallet?{' '}
            <a 
              href="https://phantom.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              Get Phantom
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Create sign-in data (in production, this should be server-side)
async function createSignInData(): Promise<SolanaSignInInput> {
  const now = new Date();
  const uri = window.location.href;
  const currentUrl = new URL(uri);
  const domain = currentUrl.host;
  const currentDateTime = now.toISOString();

  // Generate a random nonce
  const nonce = generateNonce();

  const signInData: SolanaSignInInput = {
    domain,
    statement: 'Sign in to API Marketplace. This request will not trigger any blockchain transaction or cost any gas fees.',
    version: '1',
    nonce,
    chainId: 'devnet', // TODO: Update to 'mainnet' for production
    issuedAt: currentDateTime,
    // TODO: Update with your actual application URLs
    resources: [
      'https://your-app.com',
      'https://phantom.app/'
    ],
  };

  return signInData;
}

// Generate a random nonce (minimum 8 alphanumeric characters)
function generateNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 12; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}

export default LoginPage;
