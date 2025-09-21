'use client';

import { useState } from 'react';
import { TradeEntry } from '@/lib/storage';

interface TradeFormProps {
  trade: TradeEntry;
  isEditing: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function TradeForm({
  trade,
  isEditing,
  isSubmitting,
  onCancel,
  onSubmit,
  onChange,
}: TradeFormProps) {
  return (
    <form onSubmit={onSubmit}>
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
                onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
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
                  onChange={onChange}
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
                  onChange={onChange}
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
                  onChange={onChange}
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
                  onChange={onChange}
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
                  onChange={onChange}
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
            onChange={onChange}
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
            onClick={onCancel}
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
  );
}
