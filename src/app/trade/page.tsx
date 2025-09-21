'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTradeEntries, TradeEntry } from '@/lib/storage';

export default function TradePage() {
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrades = () => {
      const allTrades = getTradeEntries();
      setTrades(allTrades);
      setIsLoading(false);
    };
    
    loadTrades();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trading Journal</h1>
        <Link 
          href="/trade/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          New Trade
        </Link>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No trades found.</p>
          <Link 
            href="/trade/new"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Create your first trade
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {trades.map((trade) => (
              <li key={trade.id}>
                <Link 
                  href={`/trade/${trade.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {trade.trade_identity.instrument}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          trade.trade_identity.direction === 'Long' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.trade_identity.direction}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {trade.trade_identity.trade_type}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {new Date(trade.trade_identity.entry_date_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
