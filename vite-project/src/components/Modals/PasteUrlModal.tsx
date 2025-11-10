import React, { useState } from "react";
import { X, Link2, DollarSign } from "lucide-react";

interface PasteUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    url: string,
    walletAddress: string,
    pricePerCall: string
  ) => Promise<void>;
}

const PasteUrlModal: React.FC<PasteUrlModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [pricePerCall, setPricePerCall] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    try {
      // basic validation
      // allow http/https URLs
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        setError("Please enter a valid http(s) URL");
        return;
      }
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      if (!walletAddress || !walletAddress.trim()) {
        setError("Wallet address is required");
        return;
      }
      if (!pricePerCall) {
        setError("Price per call is required");
        return;
      }
      await onSubmit(url.trim(), walletAddress.trim(), pricePerCall);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to import from URL"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Import from URL</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-900 rounded text-red-300 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="docUrl"
              className="block text-sm text-gray-300 mb-2"
            >
              Documentation URL
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="docUrl"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/openapi.json"
                className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Paste a URL to your hosted OpenAPI/Swagger/Postman spec
            </p>
            <div className="mt-3">
              <label
                htmlFor="pricePerCall"
                className="block text-sm text-gray-300 mb-2"
              >
                Price Per Call <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="pricePerCall"
                  type="text"
                  value={pricePerCall}
                  onChange={(e) => setPricePerCall(e.target.value)}
                  placeholder="$0.001"
                  className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Cost per API call (e.g., $0.001, 100 usd, or free)
              </p>
            </div>
            <div className="mt-4">
              <label
                htmlFor="walletUrl"
                className="block text-sm text-gray-300 mb-2"
              >
                Wallet Address <span className="text-red-500">*</span>
              </label>
              <input
                id="walletUrl"
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x... or wallet public address"
                className="w-full bg-black border border-gray-800 rounded-lg pl-3 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-3 border border-gray-700 rounded text-gray-300 hover:bg-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 rounded text-white hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? "Importing..." : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasteUrlModal;
