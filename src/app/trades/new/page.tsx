'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveTradeEntry, getTradeById, TradeEntry } from '@/lib/storage';

const defaultTradeEntry: Omit<TradeEntry, 'id'> = {
  date: new Date().toISOString().split('T')[0],
  trade_identity: {
    instrument: '',
    entry_date_time: new Date().toISOString(),
    session: '',
    timeframe: '',
    direction: 'Long',
    trade_type: '',
    market_condition: ''
  },
  pre_trade_hypothesis: {
    setup_or_strategy_name: '',
    reason_for_entry: '',
    position_size: 0,
    account_risk_percent: 0,
    entry_price: 0,
    stop_loss_price: 0,
    take_profit_price: 0,
    planned_rr_ratio: 0
  },
  notes: ''
};

export default function NewTradePage() {
  const router = useRouter();
  const [trade, setTrade] = useState<Omit<TradeEntry, 'id'>>(defaultTradeEntry);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newTrade: TradeEntry = {
        ...trade,
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0]
      };
      
      saveTradeEntry(newTrade);
      router.push('/trades');
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Error saving trade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setTrade(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object || {}),
          [child]: value
        }
      }));
    } else {
      setTrade(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">New Trade</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trade Identity Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Trade Identity</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instrument</label>
              <input
                type="text"
                name="trade_identity.instrument"
                value={trade.trade_identity.instrument}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
              <select
                name="trade_identity.direction"
                value={trade.trade_identity.direction}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="Long">Long</option>
                <option value="Short">Short</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trade Type</label>
              <select
                name="trade_identity.trade_type"
                value={trade.trade_identity.trade_type}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select type</option>
                <option value="Scalp">Scalp</option>
                <option value="Day Trade">Day Trade</option>
                <option value="Swing">Swing</option>
                <option value="Position">Position</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Market Condition</label>
              <select
                name="trade_identity.market_condition"
                value={trade.trade_identity.market_condition}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select condition</option>
                <option value="Trending">Trending</option>
                <option value="Ranging">Ranging</option>
                <option value="Volatile">Volatile</option>
                <option value="Quiet">Quiet</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Pre-Trade Hypothesis Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pre-Trade Hypothesis</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setup/Strategy Name</label>
              <input
                type="text"
                name="pre_trade_hypothesis.setup_or_strategy_name"
                value={trade.pre_trade_hypothesis.setup_or_strategy_name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Entry</label>
              <textarea
                name="pre_trade_hypothesis.reason_for_entry"
                value={trade.pre_trade_hypothesis.reason_for_entry}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Price</label>
                <input
                  type="number"
                  step="0.00001"
                  name="pre_trade_hypothesis.entry_price"
                  value={trade.pre_trade_hypothesis.entry_price || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stop Loss</label>
                <input
                  type="number"
                  step="0.00001"
                  name="pre_trade_hypothesis.stop_loss_price"
                  value={trade.pre_trade_hypothesis.stop_loss_price || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Take Profit</label>
                <input
                  type="number"
                  step="0.00001"
                  name="pre_trade_hypothesis.take_profit_price"
                  value={trade.pre_trade_hypothesis.take_profit_price || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position Size</label>
                <input
                  type="number"
                  step="0.01"
                  name="pre_trade_hypothesis.position_size"
                  value={trade.pre_trade_hypothesis.position_size || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Risk %</label>
                <input
                  type="number"
                  step="0.01"
                  name="pre_trade_hypothesis.account_risk_percent"
                  value={trade.pre_trade_hypothesis.account_risk_percent || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Notes Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
          <textarea
            name="notes"
            value={trade.notes}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border rounded"
            placeholder="Any additional notes about this trade..."
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Trade'}
          </button>
        </div>
      </form>
    </div>
  );
}
