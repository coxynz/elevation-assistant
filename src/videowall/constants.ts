import { DisplayPreset, MountingSystemType, MountingReference } from './types';

export const DISPLAY_PRESETS: DisplayPreset[] = [
  { id: 'custom', label: 'Custom Size', width: 1213, height: 684, depth: 80, weight: 20, resX: 1920, resY: 1080 },
  { id: 'philips_55bdl4105x', label: 'Philips 55BDL4105X (55")', width: 1212.2, height: 683, depth: 97.7, weight: 25.33, resX: 1920, resY: 1080 },
  { id: 'samsung_vm55b', label: 'Samsung VM55B-U (55")', width: 1211.5, height: 682.3, depth: 73.1, weight: 19.4, resX: 1920, resY: 1080 },
  { id: 'samsung_vm55c_e', label: 'Samsung VH55C-E / VM55C-E (55")', width: 1209.6, height: 680.4, depth: 70, weight: 20, resX: 1920, resY: 1080 },
  { id: 'philips_55bdl3305x', label: 'Philips 55BDL3305X (55")', width: 1211.3, height: 682.1, depth: 97.8, weight: 28.7, resX: 1920, resY: 1080 },
  { id: 'lg_55svh7f', label: 'LG 55SVH7F (55")', width: 1210.51, height: 681.22, depth: 86.5, weight: 18.6, resX: 1920, resY: 1080 },
  { id: 'nec_un552', label: 'NEC UN552 (55")', width: 1211.4, height: 682.2, depth: 99, weight: 25.8, resX: 1920, resY: 1080 },
  { id: 'barco_uni55', label: 'Barco UniSee (55")', width: 1213.5, height: 683, depth: 102, weight: 28, resX: 1920, resY: 1080 },
  { id: 'generic_46', label: 'Generic 46" LCD', width: 1022, height: 577, depth: 80, weight: 15, resX: 1920, resY: 1080 },
  { id: 'generic_55', label: 'Generic 55" LCD', width: 1213, height: 684, depth: 80, weight: 20, resX: 1920, resY: 1080 },
  { id: 'generic_65', label: 'Generic 65" LCD', width: 1450, height: 830, depth: 90, weight: 30, resX: 3840, resY: 2160 },
];

export const DEFAULT_CONFIG = {
  rows: 2,
  cols: 2,
  gap: 1.5,
  mountingReference: MountingReference.FLOOR_TO_BOTTOM,
  mountingValue: 900,
  mountingSystem: MountingSystemType.VOGELS_CONNECT_IT,
  display: DISPLAY_PRESETS[1] // Default to Philips
};