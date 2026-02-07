import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import LiveTransactions from '../components/Dashboard/LiveTransactions';
import FraudStats from '../components/Dashboard/FraudStats';
import ShopInventory from '../components/Dashboard/ShopInventory';
import { useTranslation } from 'react-i18next';

const PDSDashboard = () => {
    const { t } = useTranslation();

    return (
        <div className="container mx-auto px-4 py-8 dark:text-gray-100">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">🤖 {t('dashboard')}</h1>
                <Link
                    to="/add-event"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
                >
                    <PlusCircle className="h-5 w-5" />
                    <span>{t('new_distribution')}</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Stats Card */}
                <FraudStats />

                {/* System Status (Health Panel) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border-l-4 border-green-500">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-gray-100">
                        <span className="mr-2">💚</span> {t('system_health')}
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded transition-colors">
                            <span className="text-gray-600 dark:text-gray-300 font-medium">{t('blockchain_node')}</span>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">{t('operational')}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded transition-colors">
                            <span className="text-gray-600 dark:text-gray-300 font-medium">{t('ipfs_storage')}</span>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">{t('active')}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded transition-colors">
                            <span className="text-gray-600 dark:text-gray-300 font-medium">{t('ai_engine')}</span>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">{t('online')} v2.1</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop Inventory Section */}
            <div className="mb-8">
                <ShopInventory />
            </div>

            {/* Trust and Risk Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Shop Trust Score */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">🏪 {t('shop_trust_scores')}</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-slate-700">
                                <tr>
                                    <th className="p-2 text-left text-gray-700 dark:text-gray-200">{t('shop_id')}</th>
                                    <th className="p-2 text-left text-gray-700 dark:text-gray-200">{t('trust_score')}</th>
                                    <th className="p-2 text-left text-gray-700 dark:text-gray-200">{t('status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-slate-700">
                                    <td className="p-2 font-mono text-gray-600 dark:text-gray-300">SHOP-001</td>
                                    <td className="p-2">
                                        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">9.8/10</span>
                                    </td>
                                    <td className="p-2"><span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">{t('trusted')}</span></td>
                                </tr>
                                <tr className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-slate-700">
                                    <td className="p-2 font-mono text-gray-600 dark:text-gray-300">SHOP-042</td>
                                    <td className="p-2">
                                        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">6.5/10</span>
                                    </td>
                                    <td className="p-2"><span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">{t('watch')}</span></td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-mono text-gray-600 dark:text-gray-300">SHOP-X99</td>
                                    <td className="p-2">
                                        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">1.2/10</span>
                                    </td>
                                    <td className="p-2"><span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.5 rounded">{t('blocked')}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Region Risk Heatmap (List Representation) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">🗺️ {t('regional_fraud_risk')}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded border border-red-100 dark:border-red-800 text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">Zone-9</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{t('extreme_risk')}</div>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded border border-orange-100 dark:border-orange-800 text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">Zone-4</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{t('high_watch')}</div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded border border-green-100 dark:border-green-800 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">Zone-1</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{t('safe_zone')}</div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded border border-green-100 dark:border-green-800 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">Zone-2</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{t('safe_zone')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Data */}
            <LiveTransactions />
        </div>
    );
};

export default PDSDashboard;
