'use client';

import { useState } from 'react';

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; ticker: string; description: string; initialSupply: string }) => void;
}

export default function CreateTokenModal({ isOpen, onClose, onSubmit }: CreateTokenModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    description: '',
    initialSupply: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', ticker: '', description: '', initialSupply: '' });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
        style={{ 
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 212, 255, 0.1)' 
        }}
      >
        <div className="text-center mb-8">
          <h2 className="pixel-font text-2xl mb-2" style={{ color: 'var(--electric-blue)' }}>
            Create New Token
          </h2>
          <p className="text-gray-400 text-sm">Launch your meme coin to the world</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-semibold mb-3 uppercase tracking-wide">
              Token Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., DogeKing"
              className="w-full p-4 rounded-xl bg-black/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-semibold mb-3 uppercase tracking-wide">
              Ticker Symbol
            </label>
            <input
              type="text"
              name="ticker"
              value={formData.ticker}
              onChange={handleChange}
              placeholder="e.g., DKING"
              className="w-full p-4 rounded-xl bg-black/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all mono-font"
              maxLength={10}
              required
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-semibold mb-3 uppercase tracking-wide">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell the world about your meme coin..."
              rows={3}
              className="w-full p-4 rounded-xl bg-black/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-semibold mb-3 uppercase tracking-wide">
              Initial Supply
            </label>
            <input
              type="number"
              name="initialSupply"
              value={formData.initialSupply}
              onChange={handleChange}
              placeholder="1000000"
              className="w-full p-4 rounded-xl bg-black/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all mono-font"
              required
            />
          </div>
          
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="btn btn-primary flex-1 py-4"
            >
            Create Token
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 py-4"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}