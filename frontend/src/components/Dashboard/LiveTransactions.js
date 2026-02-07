import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:4000'; // Node Backend

const LiveTransactions = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchTransactions();
        const interval = setInterval(fetchTransactions, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await axios.get(`${API_URL}/transactions`);
            setTransactions(res.data);
        } catch (err) {
            console.error("Error fetching transactions", err);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Live PDS Transactions</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
                            <th className="px-4 py-2">Time</th>
                            <th className="px-4 py-2">Beneficiary ID</th>
                            <th className="px-4 py-2">Shop</th>
                            <th className="px-4 py-2">Quantity</th>
                            <th className="px-4 py-2">Fraud Score</th>
                            <th className="px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-300">
                        {transactions.map((tx) => (
                            <tr key={tx.id || Math.random()} className={tx.fraud_score > 0.7 ? "bg-red-50 dark:bg-red-900/20" : "border-b dark:border-slate-700"}>
                                <td className="px-4 py-2">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                                <td className="px-4 py-2 font-mono text-sm">{tx.beneficiary_id}</td>
                                <td className="px-4 py-2">{tx.shop_id}</td>
                                <td className="px-4 py-2">{tx.quantity} kg</td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded text-white ${tx.fraud_score > 0.7 ? 'bg-red-500' : tx.fraud_score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'}`}>
                                        {(tx.fraud_score * 100).toFixed(0)}%
                                    </span>
                                </td>
                                <td className="px-4 py-2">{tx.risk_level}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LiveTransactions;
