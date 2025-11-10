import React, { useState, useRef } from "react";
import { X, DollarSign, FileText } from "lucide-react";

interface UploadSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    file: File,
    walletAddress: string,
    pricePerCall: string
  ) => Promise<void>;
}

const UploadSpecModal: React.FC<UploadSpecModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  interface FormData {
    pricePerCall: string;
  }

  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<FormData>({
    pricePerCall: "",
  });
  const [walletAddress, setWalletAddress] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = file.name
      .split(".")
      .pop()
      ?.toLowerCase();
    if (!["json", "yml", "yaml"].includes(ext || "")) {
      setError("Only .json, .yml or .yaml files are accepted");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (!walletAddress || !walletAddress.trim()) {
        setError("Wallet address is required");
        return;
      }
      if (!formData.pricePerCall) {
        setError("Price per call is required");
        return;
      }
      await onUpload(file, walletAddress.trim(), formData.pricePerCall);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Upload API Spec</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-900 rounded text-red-300 mb-4">
            {error}
          </div>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`border-2 ${
            dragOver ? "border-purple-600" : "border-gray-800"
          } rounded-lg p-8 text-center cursor-pointer bg-gray-800`}
          onClick={() => inputRef.current?.click()}
        >
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">
            Drag & drop your OpenAPI/Swagger/Postman spec here
          </p>
          <p className="text-sm text-gray-500">
            Accepted: .json, .yml, .yaml — or click to browse
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".json,.yml,.yaml,application/json,text/yaml,text/plain"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
        <div>
          <label
            htmlFor="pricePerCall"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Price Per Call <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              id="pricePerCall"
              name="pricePerCall"
              value={formData.pricePerCall}
              onChange={handleChange}
              placeholder="$0.001"
              className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Cost per API call (e.g., $0.001, 100 usd, or free)
          </p>
        </div>
        <div className="mt-4 text-left">
          <label htmlFor="pricing" className="block text-sm text-gray-300 mb-2">
            Wallet Address <span className="text-red-500">*</span>
          </label>
          <input
            id="walletUpload"
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x... or wallet public address"
            className="w-full bg-black border border-gray-800 rounded-lg pl-3 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 mr-3 border border-gray-700 rounded text-gray-300 hover:bg-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              // ensure wallet provided before allowing browse
              if (!walletAddress || !walletAddress.trim()) {
                setError("Wallet address is required");
                return;
              }
              inputRef.current?.click();
            }}
            className="px-4 py-2 bg-purple-600 rounded text-white hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadSpecModal;
