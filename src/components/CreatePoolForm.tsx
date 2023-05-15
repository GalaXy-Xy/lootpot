'use client';

import { useState } from 'react';
import { parseEther } from 'ethers/lib/utils';

interface CreatePoolFormProps {
  onSubmit: (poolData: {
    name: string;
    minParticipation: string;
    winProbability: number;
    platformFeePercent: number;
    durationInDays: number;
  }) => void;
  isCreating: boolean;
}

export function CreatePoolForm({ onSubmit, isCreating }: CreatePoolFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    minParticipation: '',
    winProbability: 10,
    platformFeePercent: 20,
    durationInDays: 7,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Pool name is required';
    }

    if (!formData.minParticipation || parseFloat(formData.minParticipation) <= 0) {
      newErrors.minParticipation = 'Minimum participation must be greater than 0';
    }

    if (formData.winProbability <= 0) {
      newErrors.winProbability = 'Win probability must be greater than 0';
    }

    if (formData.platformFeePercent < 0 || formData.platformFeePercent > 50) {
      newErrors.platformFeePercent = 'Platform fee must be between 0 and 50%';
    }

    if (formData.durationInDays <= 0) {
      newErrors.durationInDays = 'Duration must be greater than 0 days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        minParticipation: parseEther(formData.minParticipation).toString(),
        winProbability: formData.winProbability,
        platformFeePercent: formData.platformFeePercent,
        durationInDays: formData.durationInDays,
      });
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="poolName" className="block text-sm font-medium text-gray-700 mb-1">
          Pool Name *
        </label>
        <input
          id="poolName"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`input-field ${errors.name ? 'border-red-500' : ''}`}
          placeholder="Enter pool name"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="minParticipation" className="block text-sm font-medium text-gray-700 mb-1">
          Minimum Participation (ETH) *
        </label>
        <input
          id="minParticipation"
          type="number"
          step="0.001"
          min="0.001"
          value={formData.minParticipation}
          onChange={(e) => handleInputChange('minParticipation', e.target.value)}
          className={`input-field ${errors.minParticipation ? 'border-red-500' : ''}`}
          placeholder="0.01"
        />
        {errors.minParticipation && <p className="text-red-500 text-sm mt-1">{errors.minParticipation}</p>}
      </div>

      <div>
        <label htmlFor="winProbability" className="block text-sm font-medium text-gray-700 mb-1">
          Win Probability (1 in X) *
        </label>
        <input
          id="winProbability"
          type="number"
          min="1"
          value={formData.winProbability}
          onChange={(e) => handleInputChange('winProbability', parseInt(e.target.value))}
          className={`input-field ${errors.winProbability ? 'border-red-500' : ''}`}
          placeholder="10"
        />
        <p className="text-gray-500 text-sm mt-1">Example: 10 means 1 in 10 chance to win</p>
        {errors.winProbability && <p className="text-red-500 text-sm mt-1">{errors.winProbability}</p>}
      </div>

      <div>
        <label htmlFor="platformFee" className="block text-sm font-medium text-gray-700 mb-1">
          Platform Fee (%) *
        </label>
        <input
          id="platformFee"
          type="number"
          min="0"
          max="50"
          value={formData.platformFeePercent}
          onChange={(e) => handleInputChange('platformFeePercent', parseInt(e.target.value))}
          className={`input-field ${errors.platformFeePercent ? 'border-red-500' : ''}`}
          placeholder="20"
        />
        <p className="text-gray-500 text-sm mt-1">Percentage of total pool that goes to platform (0-50%)</p>
        {errors.platformFeePercent && <p className="text-red-500 text-sm mt-1">{errors.platformFeePercent}</p>}
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
          Duration (Days) *
        </label>
        <input
          id="duration"
          type="number"
          min="1"
          max="365"
          value={formData.durationInDays}
          onChange={(e) => handleInputChange('durationInDays', parseInt(e.target.value))}
          className={`input-field ${errors.durationInDays ? 'border-red-500' : ''}`}
          placeholder="7"
        />
        <p className="text-gray-500 text-sm mt-1">How long the pool will be active</p>
        {errors.durationInDays && <p className="text-red-500 text-sm mt-1">{errors.durationInDays}</p>}
      </div>

      <button
        type="submit"
        disabled={isCreating}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
          isCreating
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700 text-white'
        }`}
      >
        {isCreating ? 'Creating Pool...' : 'Create Prize Pool'}
      </button>
    </form>
  );
}
