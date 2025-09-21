'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTradeEntries, TradeEntry } from '@/lib/storage';

export default function TradesPage() {
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrades = () => {
      try {
        const loadedTrades = getTradeEntries();
        // Sort by date (newest first)
        loadedTrades.sort((a, b) => 
          new Date(b.trade_identity.entry_date_time).getTime() - 
          new Date(a.trade_identity.entry_date_time).getTime()
        );
        setTrades(loadedTrades);
      } catch (error) {
        console.error('Error loading trades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrades();
    
    // Listen for storage events to update the list when trades change
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'trade-entries' || e.key === null) {
        loadTrades();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trade Journal</h1>
        <Link 
          href="/trades/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          New Trade
        </Link>
      </div>
      
      {trades.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No trades recorded yet.</p>
          <Link 
            href="/trades/new"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Record your first trade →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instrument</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setup</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(trade.trade_identity.entry_date_time).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {trade.trade_identity.instrument}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    trade.trade_identity.direction === 'Long' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {trade.trade_identity.direction}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trade.trade_identity.trade_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trade.pre_trade_hypothesis.setup_or_strategy_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      href={`/trades/${trade.id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View
                    </Link>
                    <Link 
                      href={`/trades/${trade.id}?edit=true`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
