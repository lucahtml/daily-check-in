'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getTradeById, saveTradeEntry, TradeEntry } from './lib/storage';
import Link from 'next/link';
import TradeForm from './components/TradeForm';

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
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
      
      <TradeForm 
        trade={trade}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onCancel={() => setIsEditing(false)}
        onSubmit={handleSubmit}
        onChange={handleChange}
      />
    </div>
  );
}