import type { IrBrandProfile } from '../core/remoteTypes';

/** Marques IR — les codes doivent être capturés via Réglages → Apprentissage IR */
export const IR_BRAND_DATABASE: IrBrandProfile[] = [
  { id: 'samsung', brand: 'Samsung', deviceType: 'tv', codeSets: [] },
  { id: 'lg', brand: 'LG', deviceType: 'tv', codeSets: [] },
  { id: 'sony', brand: 'Sony', deviceType: 'tv', codeSets: [] },
  { id: 'tcl', brand: 'TCL', deviceType: 'tv', codeSets: [] },
  { id: 'hisense', brand: 'Hisense', deviceType: 'tv', codeSets: [] },
  { id: 'philips', brand: 'Philips', deviceType: 'tv', codeSets: [] },
  { id: 'panasonic', brand: 'Panasonic', deviceType: 'tv', codeSets: [] },
  { id: 'xiaomi', brand: 'Xiaomi / Redmi TV', deviceType: 'tv', codeSets: [] },
];
