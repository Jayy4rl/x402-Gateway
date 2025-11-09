import React, { useState, useRef, useEffect } from "react";
import { Wallet, Copy, LogOut, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const WalletButton: React.FC = () => {
  const { walletAddress, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const handleDisconnect = () => {
    logout();
    setIsDropdownOpen(false);
  };

  if (!walletAddress) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="px-3 py-1.5 text-xs bg-gray-900 rounded border border-gray-700 hover:bg-gray-800 hover:border-gray-600 transition-colors flex items-center space-x-2"
      >
        <Wallet className="w-3 h-3" />
        <span>
          {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
        </span>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-gray-800">
            <div className="text-xs text-gray-400 mb-1">Wallet Address</div>
            <div className="text-xs font-mono text-white break-all">
              {walletAddress}
            </div>
          </div>

          <div className="p-1">
            <button
              onClick={handleCopyAddress}
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-800 rounded flex items-center space-x-2 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Address</span>
                </>
              )}
            </button>

            <button
              onClick={handleDisconnect}
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-800 rounded flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletButton;
