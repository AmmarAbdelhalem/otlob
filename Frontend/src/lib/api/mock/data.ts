import { Brand, Category, Product, VehicleMake, Vendor } from '../types';

export const mockVendors: Vendor[] = [];

export const mockMakes: VehicleMake[] = [
  { id: 'toyota', name: 'Toyota', slug: 'toyota' },
  { id: 'hyundai', name: 'Hyundai', slug: 'hyundai' },
  { id: 'nissan', name: 'Nissan', slug: 'nissan' },
  { id: 'fiat', name: 'Fiat', slug: 'fiat' },
  { id: 'chevrolet', name: 'Chevrolet', slug: 'chevrolet' },
  { id: 'kia', name: 'Kia', slug: 'kia' },
  { id: 'renault', name: 'Renault', slug: 'renault' },
  { id: 'mitsubishi', name: 'Mitsubishi', slug: 'mitsubishi' },
  { id: 'mercedes', name: 'Mercedes-Benz', slug: 'mercedes-benz' },
  { id: 'bmw', name: 'BMW', slug: 'bmw' },
];

export const mockModelsByMake: Record<string, string[]> = {
  toyota: ['Corolla', 'Yaris', 'Fortuner', 'Camry'],
  hyundai: ['Elantra HD', 'Elantra MD', 'Elantra CN7', 'Tucson', 'Verna', 'Accent RB'],
  nissan: ['Sunny N17', 'Qashqai', 'Sentra', 'Juke'],
  fiat: ['Tipo', 'Punto', '500'],
  chevrolet: ['Optra', 'Aveo', 'Cruze'],
  kia: ['Cerato', 'Sportage', 'Carens', 'Rio'],
  renault: ['Logan', 'Megane', 'Duster', 'Sandero Stepway'],
  mitsubishi: ['Lancer Shark', 'Lancer Puma', 'Attrage', 'Eclipse Cross'],
  mercedes: ['C-Class (W204)', 'C-Class (W205)', 'E-Class (W212)'],
  bmw: ['3 Series (F30)', '3 Series (G20)', '5 Series (F10)'],
};

export const mockBrands: Brand[] = [
  { id: 'denso', name: 'DENSO', slug: 'denso', logo: '/images/brands/denso.svg', country: 'Japan' },
  { id: 'bosch', name: 'BOSCH', slug: 'bosch', logo: '/images/brands/bosch.svg', country: 'Germany' },
  { id: 'brembo', name: 'Brembo', slug: 'brembo', logo: '/images/brands/brembo.svg', country: 'Italy' },
  { id: 'valeo', name: 'Valeo', slug: 'valeo', logo: '/images/brands/valeo.svg', country: 'France' },
  { id: 'mann', name: 'MANN-FILTER', slug: 'mann', logo: '/images/brands/mann.svg', country: 'Germany' },
  { id: 'ngk', name: 'NGK Spark Plugs', slug: 'ngk', logo: '/images/brands/ngk.svg', country: 'Japan' },
  { id: 'kyb', name: 'KYB Kayaba', slug: 'kyb', logo: '/images/brands/kyb.svg', country: 'Japan' },
  { id: 'aisin', name: 'AISIN', slug: 'aisin', logo: '/images/brands/aisin.svg', country: 'Japan' },
];

export const mockCategories: Category[] = [
  {
    id: 'brakes',
    name: { ar: 'منظومة الفرامل', en: 'Braking Systems' },
    slug: 'brakes',
    itemCount: 48,
    children: [
      { id: 'brake-pads', name: { ar: 'تيل فرامل (أمامي / خلفي)', en: 'Brake Pads' }, slug: 'brake-pads', itemCount: 28 },
      { id: 'brake-discs', name: { ar: 'طنابير ديسكات', en: 'Brake Discs & Rotors' }, slug: 'brake-discs', itemCount: 14 },
      { id: 'brake-calipers', name: { ar: 'ماستر وكليبر فرامل', en: 'Brake Calipers' }, slug: 'brake-calipers', itemCount: 6 },
    ],
  },
  {
    id: 'engine',
    name: { ar: 'المحرك وملحقاته', en: 'Engine & Transmission' },
    slug: 'engine',
    itemCount: 92,
    children: [
      { id: 'filters', name: { ar: 'فلاتر (زيت، هواء، بنزين)', en: 'Filters' }, slug: 'filters', itemCount: 42 },
      { id: 'belts', name: { ar: 'سيور وكاتينات', en: 'Timing Belts & Pulleys' }, slug: 'belts', itemCount: 25 },
      { id: 'spark-plugs', name: { ar: 'بوجيهات وشمعات إشعال', en: 'Spark Plugs' }, slug: 'spark-plugs', itemCount: 25 },
    ],
  },
  {
    id: 'suspension',
    name: { ar: 'العفشة والمساعدين', en: 'Suspension & Steering' },
    slug: 'suspension',
    itemCount: 64,
    children: [
      { id: 'shocks', name: { ar: 'مساعدين أمامي وخلفي', en: 'Shock Absorbers' }, slug: 'shocks', itemCount: 32 },
      { id: 'arms', name: { ar: 'مقصات وبيض مقص', en: 'Control Arms' }, slug: 'arms', itemCount: 20 },
      { id: 'steering', name: { ar: 'علبة دركسيون وبارات', en: 'Steering Racks' }, slug: 'steering', itemCount: 12 },
    ],
  },
  {
    id: 'electrical',
    name: { ar: 'الكهرباء والإضاءة', en: 'Electrical & Lighting' },
    slug: 'electrical',
    itemCount: 55,
    children: [
      { id: 'lights', name: { ar: 'فوانيس وإضاءة وفوجات', en: 'Headlights & Fog Lamps' }, slug: 'lights', itemCount: 35 },
      { id: 'batteries', name: { ar: 'بطاريات ودينامو ومارش', en: 'Batteries & Alternators' }, slug: 'batteries', itemCount: 20 },
    ],
  },
];

export const mockProducts: Product[] = [];
