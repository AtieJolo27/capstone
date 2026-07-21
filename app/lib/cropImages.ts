// Free stock image URLs for crops and fertilizers (from Unsplash)
export const CROP_IMAGES: Record<string, string> = {
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11bda3?w=200&h=200&fit=crop',
  blackgram: 'https://images.unsplash.com/photo-1608332733779-6bd1e0e7a54a?w=200&h=200&fit=crop',
  chickpea: 'https://images.unsplash.com/photo-1615547558077-3f8910c82a25?w=200&h=200&fit=crop',
  coconut: 'https://images.unsplash.com/photo-1552409021-6f3a1a5d6b8c?w=200&h=200&fit=crop',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
  cotton: 'https://images.unsplash.com/photo-1591033594798-33227b0577a0?w=200&h=200&fit=crop',
  grapes: 'https://images.unsplash.com/photo-1596363505722-19348bb4b9c7?w=200&h=200&fit=crop',
  jute: 'https://images.unsplash.com/photo-1605000794699-5e2c1e6a0f3a?w=200&h=200&fit=crop',
  kidneybeans: 'https://images.unsplash.com/photo-1551462140-22e4f7e2e2a7?w=200&h=200&fit=crop',
  lentil: 'https://images.unsplash.com/photo-1591251784077-dd9d4ef6eef3?w=200&h=200&fit=crop',
  maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&h=200&fit=crop',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop',
  mothbeans: 'https://images.unsplash.com/photo-1591280063443-d3c41fc4c3b6?w=200&h=200&fit=crop',
  mungbean: 'https://images.unsplash.com/photo-1591280063443-d3c41fc4c3b6?w=200&h=200&fit=crop',
  muskmelon: 'https://images.unsplash.com/photo-1585637071663-799845ad5212?w=200&h=200&fit=crop',
  orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=200&h=200&fit=crop',
  papaya: 'https://images.unsplash.com/photo-1615110375141-1d4e6a8aa58f?w=200&h=200&fit=crop',
  pigeonpeas: 'https://images.unsplash.com/photo-1591280063443-d3c41fc4c3b6?w=200&h=200&fit=crop',
  pomegranate: 'https://images.unsplash.com/photo-1541344999736-c83e05bff48d?w=200&h=200&fit=crop',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop',
  watermelon: 'https://images.unsplash.com/photo-1561181293-d3b9d3b0b6a0?w=200&h=200&fit=crop',
  // Default fallback
  default: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop',
};

export const FERTILIZER_IMAGES: Record<string, string> = {
  'urea': 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=200&h=200&fit=crop',
  'dap': 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=200&h=200&fit=crop',
  '14-14-14': 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=200&h=200&fit=crop',
  '20-0-0': 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=200&h=200&fit=crop',
  '16-20-0': 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=200&h=200&fit=crop',
  'muriate of potash': 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=200&h=200&fit=crop',
  'single superphosphate': 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=200&h=200&fit=crop',
  'compost': 'https://images.unsplash.com/photo-1542601906990-b4d3b4c5b3e0?w=200&h=200&fit=crop',
  default: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=200&h=200&fit=crop',
};

export function getCropImage(name: string): string {
  const key = name.toLowerCase().trim();
  return CROP_IMAGES[key] || CROP_IMAGES.default;
}

export function getFertilizerImage(name: string): string {
  const key = name.toLowerCase().trim();
  return FERTILIZER_IMAGES[key] || FERTILIZER_IMAGES.default;
}

