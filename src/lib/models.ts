export interface AIModel {
  id: string;
  name: string;
  type: 'image' | 'text' | 'audio' | 'video';
  cost: number; // Cost in Pollen
  isPaidOnly: boolean;
  description: string;
  category: 'standard' | 'hd' | 'ultra' | 'experimental';
}

export const MODELS: AIModel[] = [
  // --- IMAGE MODELS ---
  {
    id: 'flux',
    name: 'Flux Schnell',
    type: 'image',
    cost: 0.001, // listed as $0.001/img
    isPaidOnly: false,
    description: 'Fast, high-quality standard generation',
    category: 'standard'
  },
  {
    id: 'zimage',
    name: 'Z-Image Turbo',
    type: 'image',
    cost: 0.002,
    isPaidOnly: false,
    description: 'Lightning fast turbo model',
    category: 'standard'
  },
  {
    id: 'flux-2-dev',
    name: 'FLUX.2 Dev',
    type: 'image',
    cost: 0.001,
    isPaidOnly: false,
    description: 'Alpha release of Flux 2',
    category: 'experimental'
  },
  {
    id: 'imagen-4',
    name: 'Imagen 4',
    type: 'image',
    cost: 0.0025,
    isPaidOnly: false,
    description: 'Google latest image model (Alpha)',
    category: 'experimental'
  },
  {
    id: 'grok-imagine',
    name: 'Grok Imagine',
    type: 'image',
    cost: 0.0025,
    isPaidOnly: false,
    description: 'xAI image generation model',
    category: 'experimental'
  },
  {
    id: 'klein',
    name: 'FLUX.2 Klein 4B',
    type: 'image',
    cost: 0.01,
    isPaidOnly: false,
    description: 'High fidelity 4B parameter model',
    category: 'hd'
  },
  {
    id: 'klein-large',
    name: 'FLUX.2 Klein 9B',
    type: 'image',
    cost: 0.015,
    isPaidOnly: false,
    description: 'Maximum fidelity 9B parameter model',
    category: 'ultra'
  },
  // --- PAID ONLY (DIAMOND) MODELS ---
  {
    id: 'seedream',
    name: 'Seedream 4.0',
    type: 'image',
    cost: 0.03,
    isPaidOnly: true,
    description: 'Premium artistic model',
    category: 'ultra'
  },
  {
    id: 'kontext',
    name: 'FLUX.1 Kontext',
    type: 'image',
    cost: 0.04,
    isPaidOnly: true,
    description: 'Context-aware premium generation',
    category: 'ultra'
  },
  {
    id: 'nanobanana',
    name: 'NanoBanana',
    type: 'image',
    cost: 0.3, // 0.3 per image
    isPaidOnly: true,
    description: 'Advanced paid model',
    category: 'ultra'
  },
  {
    id: 'seedream-pro',
    name: 'Seedream 4.5 Pro',
    type: 'image',
    cost: 0.04,
    isPaidOnly: true,
    description: 'Professional grade artistic model',
    category: 'ultra'
  },
  {
    id: 'nanobanana-2',
    name: 'NanoBanana 2',
    type: 'image',
    cost: 0.5,
    isPaidOnly: true,
    description: 'Next-gen NanoBanana model',
    category: 'ultra'
  },
  {
    id: 'gptimage-large',
    name: 'GPT Image 1.5',
    type: 'image',
    cost: 8.0, // 8.0 per image?! Listed as 8.0 / M (tokens) or img? Table says /img for Output Pollen
    isPaidOnly: true,
    description: 'Large scale GPT-based image generation',
    category: 'ultra'
  },
  {
    id: 'nanobanana-pro',
    name: 'NanoBanana Pro',
    type: 'image',
    cost: 1.25,
    isPaidOnly: true,
    description: 'Professional tier NanoBanana',
    category: 'ultra'
  },
  {
    id: 'seedream5',
    name: 'Seedream 5.0 Lite',
    type: 'image',
    cost: 0.035,
    isPaidOnly: true,
    description: 'Latest Seedream lite version',
    category: 'ultra'
  }
];

export const TIER_LIMITS = {
  SEED: { dailyPollen: 3, name: 'Seed' },
  SPORE: { dailyPollen: 0.2, name: 'Spore' }, // 1.5 per week approx 0.2/day
  FLOWER: { dailyPollen: 10, name: 'Flower' },
  NECTAR: { dailyPollen: 20, name: 'Nectar' }
};
