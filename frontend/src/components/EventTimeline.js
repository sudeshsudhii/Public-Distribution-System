import React, { useState, useEffect } from 'react';
import { Clock, Copy, CheckCircle, Loader2, AlertCircle, QrCode, ExternalLink } from 'lucide-react';
import { eventService } from '../services/api';
import { useTranslation } from 'react-i18next';

const EventTimeline = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getAllEvents();
      const sortedEvents = data.sort((a, b) => {
        const timestampA = a.timestamp?.toString() || '0';
        const timestampB = b.timestamp?.toString() || '0';
        return timestampB.localeCompare(timestampA);
      });
      setEvents(sortedEvents);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, hash) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(Number(timestamp) * 1000);
      return date.toLocaleString();
    } catch {
      return timestamp.toString();
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No events found</h2>
        <p className="text-gray-600">Create your first event to get started!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          {t('timeline')}
        </h1>
        <p className="text-gray-600">All events recorded on the blockchain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const ipfsHash = event.ipfsHash || event.metadataHash || 'N/A';
          const isPDSEvent = event.eventType === 'PDS_DISTRIBUTION';

          return (
            <div key={event.index?.toString() || Math.random()} className={`card group hover:scale-105 transition-transform ${isPDSEvent ? 'border-l-4 border-blue-500' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${isPDSEvent ? 'bg-blue-100 text-blue-800' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'}`}>
                  {event.eventType || 'Unknown'}
                </span>
                <span className="text-xs text-gray-500 font-mono">#{event.index?.toString() || 'N/A'}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Actor</p>
                  <p className="font-mono text-sm text-gray-900 break-all">{formatAddress(event.actor)}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Timestamp</p>
                  <p className="text-sm text-gray-700 flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimestamp(event.timestamp)}</span>
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">IPFS Hash</p>
                  <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                    <p className="font-mono text-xs text-gray-900 break-all flex-1">{ipfsHash}</p>
                    <button
                      onClick={() => copyToClipboard(ipfsHash, ipfsHash)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title={copiedHash === ipfsHash ? 'Copied!' : 'Copy hash'}
                    >
                      {copiedHash === ipfsHash ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {event.transactionHash && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Transaction Hash</p>
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                      <p className="font-mono text-xs text-gray-900 break-all flex-1">{formatAddress(event.transactionHash)}</p>
                      <button
                        onClick={() => copyToClipboard(event.transactionHash, event.transactionHash)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title={copiedHash === event.transactionHash ? 'Copied!' : 'Copy hash'}
                      >
                        {copiedHash === event.transactionHash ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {isPDSEvent && (
                  <div className="pt-2">
                    <a href={`/verify?hash=${ipfsHash}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1">
                      <span>View Verification Details</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}

                {(event.ipfsHash || event.metadataHash) && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center space-x-1">
                      <QrCode className="h-4 w-4" />
                      <span>QR Code</span>
                    </p>
                    {/* QR Code (Generated on Frontend) */}
                    <div className="flex justify-center bg-white p-3 rounded-lg">
                      <div className="flex-shrink-0">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${event.ipfsHash || event.metadataHash}`}
                          alt="Event QR"
                          className="w-24 h-24 border rounded-lg p-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default EventTimeline;
