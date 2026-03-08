export interface GenerationParams {
  message: string;
  style: string;
  size: string;
  quality: string;
  model: string;
  seed: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  size: string;
  quality: string;
  model: string;
  seed: number;
  timestamp: string;
  cost?: number;
}

export interface StyleOption {
  value: string;
  label: string;
  description: string;
}

export interface QualityOption {
  value: string;
  label: string;
  description: string;
}

export interface ModelOption {
  value: string;
  label: string;
  description: string;
  isPaidOnly?: boolean;
  cost?: number;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  tier: 'SEED' | 'SPORE' | 'FLOWER' | 'NECTAR';
  pollen: number;
}
