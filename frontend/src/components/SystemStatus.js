import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useWallet } from '../context/WalletContext';

const SystemStatus = () => {
    const { t } = useTranslation();
    const { isConnected } = useWallet();
    const [status, setStatus] = useState(() => {
        const saved = localStorage.getItem('systemStatus');
        return saved ? JSON.parse(saved) : {
            blockchain: false,
            ipfs: false,
            ai: false,
            lastSync: Date.now()
        };
    });

    const checkHealth = async () => {
        const newStatus = { ...status, lastSync: Date.now() };

        // Check Blockchain
        newStatus.blockchain = isConnected;

        // Check IPFS
        try {
            // Try to fetch a known public IPFS gateway or local
            // Using no-cors mode allows request to succeed continuously without CORS error blocking code execution
            // but result body is opaque. We just care if it doesn't throw Network Error.
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            // If local IPFS is running on 5001, this might fail CORS but we can try 8080 gateway
            await fetch('http://localhost:8080/ipfs/QmUNLLsPGWtnA3CDxEn72KJydbWa1Xp8F59J4J4jQx9nB', {
                method: 'HEAD',
                signal: controller.signal,
                mode: 'no-cors'
            });
            newStatus.ipfs = true; // If no network error thrown, assume reachable
            clearTimeout(timeoutId);
        } catch (e) {
            // Also try public gateway if local fails?
            // For now, strict red if local fails
            newStatus.ipfs = false;
        }

        // Check AI Engine
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            await fetch('http://localhost:5000/model-health', {
                signal: controller.signal,
                mode: 'no-cors'
            });
            newStatus.ai = true; // Assume online if reachable
            clearTimeout(timeoutId);
        } catch (e) { newStatus.ai = false; }

        setStatus(newStatus);
        localStorage.setItem('systemStatus', JSON.stringify(newStatus));
    };

    useEffect(() => {
        checkHealth(); // Initial check
        const interval = setInterval(checkHealth, 10000); // 10s poll
        return () => clearInterval(interval);
    }, [isConnected]);

    const StatusDot = ({ label, active }) => (
        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded border border-gray-200 dark:border-slate-700">
            <div className={`h-2 w-2 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 hidden lg:inline-block">{label}</span>
        </div>
    );

    const timeSince = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        return `${seconds}s`;
    };

    return (
        <div className="flex items-center space-x-4 pr-4 mr-2">
            <StatusDot label={t('blockchain_connected')} active={status.blockchain} />
            <StatusDot label={t('ipfs_online')} active={status.ipfs} />
            <StatusDot label={t('ai_online')} active={status.ai} />
        </div>
    );
};

export default SystemStatus;
