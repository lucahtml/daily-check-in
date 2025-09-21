'use client';

import { useParams, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getTradeById, saveTradeEntry, TradeEntry } from '@/lib/storage';
import Link from 'next/link';

// Workaround for useSearchParams in static export
const useSearchParams = () => {
  const searchParams = useNextSearchParams();
  const [params, setParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setParams(new URLSearchParams(window.location.search));
    }
  }, [searchParams]);

  return params;
};

// Reuse the default trade entry from the new page
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

export default function TradeDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const id = params?.id as string;
  const isEditMode = searchParams?.get('edit') === 'true';
  
  // Add a loading state while search params are being loaded
  const [isParamsReady, setIsParamsReady] = useState(false);
  
  useEffect(() => {
    if (searchParams !== null) {
      setIsParamsReady(true);
    }
  }, [searchParams]);
  
  const [trade, setTrade] = useState<TradeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      try {
        const loadedTrade = getTradeById(id);
        if (loadedTrade) {
          setTrade(loadedTrade);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading trade:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      setTrade({
        ...defaultTradeEntry,
        id: crypto.randomUUID(),
      } as TradeEntry);
      setIsLoading(false);
      setIsEditing(true);
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trade) return;
    
    setIsSubmitting(true);
    
    try {
      saveTradeEntry(trade);
      setIsEditing(false);
      // Use push instead of replace to ensure proper navigation
      router.push(`/trades/${trade.id}`);
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Error saving trade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!trade) return;
    
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setTrade(prev => ({
        ...prev!,
        [parent]: {
          ...(prev![parent as keyof typeof prev] as object || {}),
          [child]: value
        }
      }));
    } else {
      setTrade(prev => ({
        ...prev!,
        [name]: value
      }));
    }
  };

  // Show loading state while waiting for search params
  if (!isParamsReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Handle 404 case
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Trade not found</h1>
          <p className="mb-4">The trade you're looking for doesn't exist or has been deleted.</p>
          <Link 
            href="/trades" 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Trades
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!trade) return null;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? (id === 'new' ? 'New Trade' : 'Edit Trade') : 'Trade Details'}
        </h1>
        
        {!isEditing ? (
          <div className="space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
            <Link 
              href="/trades"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Trades
            </Link>
          </div>
        ) : (
          <button
            onClick={() => isEditing ? setIsEditing(false) : router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Trade Identity</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instrument</label>
              {isEditing ? (
                <input
                  type="text"
                  name="trade_identity.instrument"
                  value={trade.trade_identity.instrument}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{trade.trade_identity.instrument}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
              {isEditing ? (
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
              ) : (
                <p className={`p-2 rounded ${
                  trade.trade_identity.direction === 'Long' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {trade.trade_identity.direction}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trade Type</label>
              {isEditing ? (
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
              ) : (
                <p className="p-2 bg-gray-50 rounded">{trade.trade_identity.trade_type || '-'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Market Condition</label>
              {isEditing ? (
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
              ) : (
                <p className="p-2 bg-gray-50 rounded">{trade.trade_identity.market_condition || '-'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              {isEditing ? (
                <input
                  type="datetime-local"
                  name="trade_identity.entry_date_time"
                  value={trade.trade_identity.entry_date_time.replace('Z', '')}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">
                  {new Date(trade.trade_identity.entry_date_time).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Pre-Trade Hypothesis</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setup/Strategy Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="pre_trade_hypothesis.setup_or_strategy_name"
                  value={trade.pre_trade_hypothesis.setup_or_strategy_name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">
                  {trade.pre_trade_hypothesis.setup_or_strategy_name || '-'}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Entry</label>
              {isEditing ? (
                <textarea
                  name="pre_trade_hypothesis.reason_for_entry"
                  value={trade.pre_trade_hypothesis.reason_for_entry}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border rounded"
                  required
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded whitespace-pre-line">
                  {trade.pre_trade_hypothesis.reason_for_entry || '-'}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Price</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.00001"
                    name="pre_trade_hypothesis.entry_price"
                    value={trade.pre_trade_hypothesis.entry_price || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">
                    {trade.pre_trade_hypothesis.entry_price || '-'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stop Loss</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.00001"
                    name="pre_trade_hypothesis.stop_loss_price"
                    value={trade.pre_trade_hypothesis.stop_loss_price || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">
                    {trade.pre_trade_hypothesis.stop_loss_price || '-'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Take Profit</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.00001"
                    name="pre_trade_hypothesis.take_profit_price"
                    value={trade.pre_trade_hypothesis.take_profit_price || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">
                    {trade.pre_trade_hypothesis.take_profit_price || '-'}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position Size</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    name="pre_trade_hypothesis.position_size"
                    value={trade.pre_trade_hypothesis.position_size || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">
                    {trade.pre_trade_hypothesis.position_size || '-'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Risk %</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    name="pre_trade_hypothesis.account_risk_percent"
                    value={trade.pre_trade_hypothesis.account_risk_percent || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">
                    {trade.pre_trade_hypothesis.account_risk_percent ? 
                      `${trade.pre_trade_hypothesis.account_risk_percent}%` : 
                      '-'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          {isEditing ? (
            <textarea
              name="notes"
              value={trade.notes || ''}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border rounded"
              placeholder="Any additional notes about this trade..."
            />
          ) : (
            <p className="p-2 bg-gray-50 rounded whitespace-pre-line">
              {trade.notes || 'No notes available.'}
            </p>
          )}
        </div>
        
        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => isEditing ? setIsEditing(false) : router.back()}
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
        )}
      </form>
    </div>
  );
}