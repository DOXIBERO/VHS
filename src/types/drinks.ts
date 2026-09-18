export type DrinkType = 'atay' | 'qahwa' | 'limon' | 'avocat' | 'monada_safra' | 'monada_tofe7';

export type CupStyle = 'authentic' | 'plastic_all';

export interface DrinkDef {
  id: DrinkType;
  nameAr: string;
  nameEn: string;
  icon: string;
  cupType: 'kas_7yati' | 'kas_qahwa' | 'kas_plastic';
  liquidColor: number;
  meniscusColor: number;
  streamColor: number;
  opacity: number;
  roughness: number;
  metalness: number;
  viscosity: number; // 0.6 = light/fizzy, 1.0 = normal, 2.3 = thick shake
  hasMint: boolean;
  isFizzy: boolean;
  bubbleColor?: number;
  descriptionAr: string;
}

export const DRINKS: Record<DrinkType, DrinkDef> = {
  atay: {
    id: 'atay',
    nameAr: 'أتاي بنعناع',
    nameEn: 'Moroccan Mint Tea',
    icon: '🍵',
    cupType: 'kas_7yati',       // Authentic Kas d 7yati glass with arabesque band
    liquidColor: 0x8a3c0e,      // Luminous warm amber-ruby mint tea
    meniscusColor: 0x944212,    // Smooth glowing amber surface
    streamColor: 0xa84a14,      // Warm golden stream
    opacity: 0.72,              // Clear & translucent
    roughness: 0.08,
    metalness: 0.05,
    viscosity: 0.95,            // Natural watery fluid
    hasMint: true,              // Authentic fresh mint sprig
    isFizzy: false,
    descriptionAr: 'أتاي مغربي مشحر بالنعناع، لون عنبري صافي وريحة زكية',
  },
  qahwa: {
    id: 'qahwa',
    nameAr: 'قهوة كحلة',
    nameEn: 'Moroccan Dark Espresso',
    icon: '☕',
    cupType: 'kas_qahwa',       // Classic café espresso glass
    liquidColor: 0x24140b,      // Deep roasted spiced espresso
    meniscusColor: 0x3d2212,    // Mahogany sheen surface
    streamColor: 0x54321b,      // Dark mahogany espresso stream
    opacity: 0.91,
    roughness: 0.12,
    metalness: 0.04,
    viscosity: 1.10,
    hasMint: false,
    isFizzy: false,
    descriptionAr: 'قهوة كحلة معصرة مقطرة على اليد، ثقيلة ومنعشة',
  },
  limon: {
    id: 'limon',
    nameAr: 'عصير البرتقال',
    nameEn: 'Fresh Orange Juice',
    icon: '🍊',
    cupType: 'kas_plastic',     // Transparent plastic cup
    liquidColor: 0xe67e22,      // Natural golden-orange citrus
    meniscusColor: 0xf39c12,    // Fresh juice surface
    streamColor: 0xf5b041,      // Citrus juice stream
    opacity: 0.82,              // Semi-translucent fresh juice
    roughness: 0.16,
    metalness: 0.02,
    viscosity: 1.05,
    hasMint: false,
    isFizzy: false,
    descriptionAr: 'عصير ليمون طبيعي معصور طازج ومنعش',
  },
  avocat: {
    id: 'avocat',
    nameAr: 'عصير الأفوكا',
    nameEn: 'Avocado Milk Shake',
    icon: '🥑',
    cupType: 'kas_plastic',     // Transparent plastic cup
    liquidColor: 0x65a30d,      // Pastel creamy avocado green
    meniscusColor: 0x84cc16,    // Silky avocado surface
    streamColor: 0xa3e635,      // Thick smoothie pour
    opacity: 0.96,              // Heavy opaque smoothie
    roughness: 0.38,
    metalness: 0.02,
    viscosity: 2.30,            // Heavy, slow fluid dynamics
    hasMint: false,
    isFizzy: false,
    descriptionAr: 'عصير أفوكا خاتر بالحليب واللوز',
  },
  monada_safra: {
    id: 'monada_safra',
    nameAr: 'مونادا صفرا',
    nameEn: 'Yellow Citrus Soda',
    icon: '🍋',
    cupType: 'kas_plastic',     // Transparent plastic cup
    liquidColor: 0xf59e0b,      // Bright glowing yellow-orange soda
    meniscusColor: 0xfbbf24,    // Golden sparkling surface
    streamColor: 0xfcd34d,      // Sparkling soda stream
    opacity: 0.78,
    roughness: 0.06,
    metalness: 0.08,
    viscosity: 0.70,            // Light, rapid effervescent ripples
    hasMint: false,
    isFizzy: true,              // Rising carbonation bubbles
    bubbleColor: 0xfef08a,
    descriptionAr: 'مونادا صفرا استوائية غازية مع فقاعات منعشة',
  },
  monada_tofe7: {
    id: 'monada_tofe7',
    nameAr: 'مونادا تفاح',
    nameEn: 'Sparkling Apple Soda',
    icon: '🍏',
    cupType: 'kas_plastic',     // Transparent plastic cup
    liquidColor: 0xd97706,      // Crisp golden apple cider amber
    meniscusColor: 0xeab308,    // Sparkling gold surface
    streamColor: 0xfde047,      // Crisp apple stream
    opacity: 0.75,
    roughness: 0.06,
    metalness: 0.08,
    viscosity: 0.72,
    hasMint: false,
    isFizzy: true,
    bubbleColor: 0xfef9c3,
    descriptionAr: 'مونادا تفاح غازية خفيفة مع فقاعات ذهبية',
  },
};
