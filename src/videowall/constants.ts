import { DisplayPreset, MountingSystemType, MountingReference } from './types';

export const DISPLAY_PRESETS: DisplayPreset[] = [
  { id: 'custom', label: 'Custom Size', width: 1213, height: 684, depth: 80, weight: 20, resX: 1920, resY: 1080 },
  { id: 'philips_55bdl4105x', label: 'Philips 55BDL4105X (55")', width: 1212.2, height: 683, depth: 97.7, weight: 25.33, resX: 1920, resY: 1080 },
  { id: 'samsung_vm55b', label: 'Samsung VM55B-U (55")', width: 1211.5, height: 682.3, depth: 73.1, weight: 19.4, resX: 1920, resY: 1080 },
  { id: 'samsung_vm55c_e', label: 'Samsung VH55C-E / VM55C-E (55")', width: 1209.6, height: 680.4, depth: 70, weight: 20, resX: 1920, resY: 1080 },
  { id: 'philips_55bdl3305x', label: 'Philips 55BDL3305X (55")', width: 1211.3, height: 682.1, depth: 97.8, weight: 28.7, resX: 1920, resY: 1080 },
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