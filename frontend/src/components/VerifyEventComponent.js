import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Hash, QrCode, Loader2, CheckCircle, XCircle, AlertCircle, Camera, X, FileText } from 'lucide-react';
import { Html5Qrcode } from "html5-qrcode";
import { eventService } from '../services/api';
import { generateVerificationPDF } from '../services/pdfGenerator';
import QrCodeDisplay from './QrCodeDisplay';
import { useTranslation } from 'react-i18next';

const VerifyEventComponent = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [hash, setHash] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const qrCodeRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlHash = searchParams.get('hash');
    if (urlHash) {
      setHash(urlHash);
      handleVerify(urlHash);
    }
  }, [location]);

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
    if (newValue === 0 && scanning) {
      stopScanning();
    }
    setHash('');
    setResult(null);
    setError(null);
  };

  // Adjusted to safely handle argument types
  const handleVerify = async (hashArg) => {
    // If hashArg is an event object (from onClick), ignore it and use state 'hash'
    // If hashArg is a string, use it.
    let targetHash = hash;
    if (typeof hashArg === 'string') {
      targetHash = hashArg;
    }

    if (!targetHash || !targetHash.trim()) {
      setError('Please enter a hash to verify');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await eventService.verifyHash(targetHash.trim());
      setResult(response);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to verify hash'
      );
    } finally {
      setLoading(false);
    }
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current.clear();
          html5QrCodeRef.current = null;
        })
        .catch((err) => {
          console.error('Error stopping QR scanner:', err);
        });
    }
    setScanning(false);
  };

  const startScanning = () => {
    setError(null);
    setScanning(true);
  };

  // Initialize QR scanner when scanning state becomes true and element is rendered
  useEffect(() => {
    if (!scanning || tabValue !== 1) {
      return;
    }

    const initializeScanner = async () => {
      try {
        const elementId = 'qr-reader';
        const element = document.getElementById(elementId);

        if (!element) {
          setTimeout(initializeScanner, 100);
          return;
        }

        if (html5QrCodeRef.current) {
          try { await html5QrCodeRef.current.stop(); html5QrCodeRef.current.clear(); } catch (e) { }
        }

        const html5QrCode = new Html5Qrcode(elementId);
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            let extractedHash = decodedText;

            try {
              // 1. Try JSON Parse
              const parsed = JSON.parse(decodedText);
              if (parsed.hash) extractedHash = parsed.hash;
              else if (parsed.metadataHash) extractedHash = parsed.metadataHash;
              else if (parsed.ipfsHash) extractedHash = parsed.ipfsHash;
              else if (parsed.eventHash) extractedHash = parsed.eventHash;
            } catch (e) {
              // 2. Try URL Parse
              if (decodedText.startsWith('http')) {
                try {
                  const url = new URL(decodedText);
                  const hashParam = url.searchParams.get('hash');
                  if (hashParam) extractedHash = hashParam;
                } catch (urlErr) { }
              }
            }

            console.log("QR Scanned:", extractedHash);
            setHash(extractedHash);
            stopScanning();
            setTabValue(0); // Switch to input tab

            // Auto-trigger verification
            setTimeout(() => {
              handleVerify(extractedHash);
            }, 300);
          },
          (errorMessage) => { }
        );
      } catch (err) {
        console.error('QR Scan Error:', err);
        setError('Error starting QR scanner. Please ensure camera permissions are granted.');
        setScanning(false);
      }
    };

    initializeScanner();

    // Cleanup on unmount or when scanning stops
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {
          // Ignore errors
        });
      }
    };
  }, [scanning, tabValue]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        stopScanning();
      }
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          {t('verify')}
        </h1>
        <p className="text-gray-600">
          Verify the authenticity of an event by entering its IPFS hash or scanning a QR code
        </p>
      </div>

      <div className="card">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleTabChange(0)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all ${tabValue === 0
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <Hash className="h-5 w-5" />
            <span>Enter Hash</span>
          </button>
          <button
            onClick={() => handleTabChange(1)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all ${tabValue === 1
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <QrCode className="h-5 w-5" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* Hash Input Tab */}
        {tabValue === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IPFS Hash
              </label>
              <input
                type="text"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="Enter IPFS hash (e.g., QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco)"
                className="input-field"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={loading || !hash.trim()}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Verify Hash</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* QR Scanner Tab */}
        {tabValue === 1 && (
          <div className="space-y-4">
            {scanning ? (
              <div>
                <div
                  id="qr-reader"
                  ref={qrCodeRef}
                  className="w-full max-w-md mx-auto mb-4 rounded-lg overflow-hidden"
                  style={{ minHeight: '250px' }}
                ></div>
                <button
                  onClick={() => {
                    stopScanning();
                    setTabValue(0);
                  }}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>Cancel Scan</span>
                </button>
              </div>
            ) : (
              <button
                onClick={startScanning}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Camera className="h-5 w-5" />
                <span>Start QR Scanner</span>
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-slide-up">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Verification Result */}
        {result && (
          <div className="mt-6 card animate-slide-up">
            <div className="flex items-center space-x-3 mb-4">
              {result.exists ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
              <h3 className="text-xl font-bold text-gray-800">Verification Result</h3>
            </div>
            <div className={`p-4 rounded-lg mb-4 ${result.exists ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
              <p className={`font-semibold ${result.exists ? 'text-green-800' : 'text-red-800'
                }`}>
                {result.exists
                  ? `✔ ${t('status_verified')}`
                  : "❌ Verification Failed - This event does not exist on the blockchain ledger."}
              </p>
              {!result.exists && <ul className="list-disc pl-5 mt-2 text-sm text-red-700">
                <li>Invalid QR code or Hash</li>
                <li>Tampered IPFS data</li>
                <li>Event not yet confirmed on blockchain</li>
              </ul>}
            </div>

            {result.exists && result.event && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-gray-700">Event Index:</span>
                    <div className="font-mono text-gray-900">{result.event.index?.toString()}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Event Type:</span>
                    <div className="font-medium text-blue-600">{result.event.eventType}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <span className="font-semibold text-gray-700">Actor Address:</span>
                  <div className="font-mono text-xs break-all text-gray-600">{result.event.actor}</div>
                </div>

                {/* PDS Content Display */}
                {result.content && result.content.type === 'PDS_DISTRIBUTION' && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center space-x-2">
                      <span>📦 PDS Distribution Details</span>
                      {result.content.aiAnalysis?.status === 'FLAGGED' &&
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">FLAGGED</span>
                      }
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                      <div>
                        <span className="text-xs text-gray-500 uppercase font-semibold">Beneficiary ID</span>
                        <div className="font-mono font-medium">{result.content.data.beneficiaryId || 'Confidential'}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase font-semibold">Shop ID</span>
                        <div className="font-medium">{result.content.data.shopId}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase font-semibold">Quantity</span>
                        <div className="font-medium">{result.content.data.quantity} kg</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase font-semibold">Risk Level</span>
                        <div className={`font-bold ${result.content.aiAnalysis?.riskLevel === 'HIGH' ? 'text-red-600' : 'text-green-600'}`}>
                          {result.content.aiAnalysis?.riskLevel} ({(result.content.aiAnalysis?.fraudScore * 100).toFixed(0)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generic Content Display if NOT PDS or Fallback */}
                {result.content && result.content.type !== 'PDS_DISTRIBUTION' && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-bold text-gray-800 mb-2">Metadata Content</h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(result.content, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Cryptographically Verified</span>
                </div>

                <div className="flex flex-col items-center mt-6 pt-4 border-t border-gray-200">
                  <div className="mb-4">
                    {/* Show event hash or specific verification data */}
                    <QrCodeDisplay data={JSON.stringify({ verified: true, hash: result.event.ipfsHash })} />
                  </div>

                  <button
                    onClick={() => generateVerificationPDF(result)}
                    className="btn-primary w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
                  >
                    <FileText className="h-5 w-5" />
                    <span>{t('download_pdf')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEventComponent;
