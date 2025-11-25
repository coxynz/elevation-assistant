
import { Preset, MountingScenario, MountingBracket } from './types';

// Generic approx dimensions for standard 16:9 displays (inc bezel)
export const DISPLAY_PRESETS: Preset[] = [
  {
    id: 'generic-55',
    label: '55" Generic Display',
    dimensions: { width: 1230, height: 710, diagonalInch: 55, name: 'Generic 55"' }
  },
  {
    id: 'generic-65',
    label: '65" Generic Display',
    dimensions: { width: 1450, height: 830, diagonalInch: 65, name: 'Generic 65"' }
  },
  {
    id: 'generic-75',
    label: '75" Generic Display',
    dimensions: { width: 1670, height: 960, diagonalInch: 75, name: 'Generic 75"' }
  },
  {
    id: 'generic-85',
    label: '85" Generic Display',
    dimensions: { width: 1890, height: 1090, diagonalInch: 85, name: 'Generic 85"' }
  },
  {
    id: 'generic-98',
    label: '98" Generic Display',
    dimensions: { width: 2190, height: 1250, diagonalInch: 98, name: 'Generic 98"' }
  },
  // Sony BZ30L Series
  {
    id: 'sony-fw-98bz30l',
    label: 'Sony FW-98BZ30L (98")',
    dimensions: { width: 2199, height: 1255, depth: 85, diagonalInch: 98, name: 'Sony FW-98BZ30L' }
  },
  {
    id: 'sony-fw-85bz30l',
    label: 'Sony FW-85BZ30L (85")',
    dimensions: { width: 1899, height: 1089, depth: 71, diagonalInch: 85, name: 'Sony FW-85BZ30L' }
  },
  {
    id: 'sony-fw-75bz30l',
    label: 'Sony FW-75BZ30L (75")',
    dimensions: { width: 1686, height: 969, depth: 72, diagonalInch: 75, name: 'Sony FW-75BZ30L' }
  },
  {
    id: 'sony-fw-65bz30l',
    label: 'Sony FW-65BZ30L (65")',
    dimensions: { width: 1462, height: 842, depth: 71, diagonalInch: 65, name: 'Sony FW-65BZ30L' }
  },
  {
    id: 'sony-fw-55bz30l',
    label: 'Sony FW-55BZ30L (55")',
    dimensions: { width: 1243, height: 721, depth: 71, diagonalInch: 55, name: 'Sony FW-55BZ30L' }
  },
  {
    id: 'sony-fw-50bz30l',
    label: 'Sony FW-50BZ30L (50")',
    dimensions: { width: 1126, height: 653, depth: 70, diagonalInch: 50, name: 'Sony FW-50BZ30L' }
  },
  {
    id: 'sony-fw-43bz30l',
    label: 'Sony FW-43BZ30L (43")',
    dimensions: { width: 972, height: 567, depth: 70, diagonalInch: 43, name: 'Sony FW-43BZ30L' }
  }
];

export const BRACKET_PRESETS: MountingBracket[] = [
  {
    id: 'none',
    label: 'None / Hidden',
    modelName: '',
    width: 0,
    height: 0,
    depth: 0
  },
  {
    id: 'chief-lsm1u',
    label: 'Chief LSM1U (Fixed)',
    modelName: 'Chief LSM1U',
    // Width is wall rail width (34.75" / 883mm). 
    // Height is the Upright/Interface bracket height (17.0" / 432mm)
    width: 883,
    height: 432,
    depth: 51
  }
];

export const EYE_LEVEL_SEATED = 1200; // mm
export const EYE_LEVEL_STANDING = 1500; // mm
export const CAMERA_HEIGHT_STANDARD = 1100; // mm
export const TABLE_HEIGHT = 750; // mm
export const ADA_MAX_INTERACTIVE_HEIGHT = 1220; // mm (48")
export const ADA_MIN_INTERACTIVE_HEIGHT = 610; // mm (24")

export const MOUNTING_SCENARIOS: MountingScenario[] = [
  {
    id: 'meeting-huddle',
    label: 'Huddle / Small Conference',
    description: 'Seated viewing for 10-15 occupants. Center aligned ~1.2m.',
    calculateTarget: () => ({
      value: 1200,
      reference: 'center'
    }),
    validate: (affl, height, ref) => {
      const bottom = ref === 'bottom' ? affl : affl - (height / 2);
      if (bottom < TABLE_HEIGHT) return { type: 'warning', message: 'Bottom edge is below standard table height (750mm).' };
      return null;
    }
  },
  {
    id: 'meeting-conference',
    label: 'Medium / Large Conference',
    description: 'Seated viewing for 15+ occupants. Center aligned ~1.35m.',
    calculateTarget: () => ({
      value: 1350,
      reference: 'center'
    }),
    validate: (affl, height, ref) => {
      const bottom = ref === 'bottom' ? affl : affl - (height / 2);
      if (bottom < TABLE_HEIGHT) return { type: 'warning', message: 'Bottom edge is below standard table height (750mm).' };
      return null;
    }
  },
  {
    id: 'video-conference',
    label: 'Video Conferencing (VC)',
    description: 'Optimized for eye contact. Display mounted above 1.1m camera.',
    calculateTarget: () => ({
      value: CAMERA_HEIGHT_STANDARD + 300, // Camera (1100) + Gap (300) = 1400mm to Bottom
      reference: 'bottom'
    }),
    validate: (affl, height, ref) => {
      const bottom = ref === 'bottom' ? affl : affl - (height / 2);
      if (bottom < CAMERA_HEIGHT_STANDARD) return { type: 'warning', message: 'Display may obstruct camera position (1100mm).' };
      return null;
    }
  },
  {
    id: 'education',
    label: 'Education / Lecture Hall',
    description: 'High mounting for rear visibility. Bottom edge > 1.22m.',
    calculateTarget: () => ({
      value: 1220,
      reference: 'bottom'
    }),
    validate: (affl, height, ref) => {
      const bottom = ref === 'bottom' ? affl : affl - (height / 2);
      if (bottom < 1220) return { type: 'warning', message: 'Bottom edge below 1220mm may be blocked for rear viewers.' };
      return null;
    }
  },
  {
    id: 'signage-interactive',
    label: 'Interactive Signage (ADA)',
    description: 'Touchscreen accessibility. Controls within 24-48" (610-1220mm).',
    calculateTarget: (h) => ({
      value: 1000, // Center at 1m puts a typical 55" screen within range
      reference: 'center'
    }),
    validate: (affl, height, ref) => {
      const center = ref === 'center' ? affl : affl + (height / 2);
      // Rough check: Center shouldn't be too high. 
      // A more precise check would need to know where the "interactive elements" are, 
      // but checking the top/bottom of the screen is a decent proxy.
      const top = center + (height / 2);
      if (top > 1400) return { type: 'warning', message: 'Top of screen may exceed ADA reach range (check specific UI elements).' };
      return null;
    }
  },
  {
    id: 'signage-passive',
    label: 'Passive Signage / Retail',
    description: 'Standing eye level visibility (1.5m - 1.7m center).',
    calculateTarget: () => ({
      value: 1600,
      reference: 'center'
    })
  },
  {
    id: 'home-theater',
    label: 'Home Theater',
    description: 'Lower mounting for comfortable sofa viewing.',
    calculateTarget: () => ({
      value: 1150,
      reference: 'center'
    })
  },
  {
    id: 'general',
    label: 'Custom / General Use',
    description: 'Manual control without auto-adjustments.',
    calculateTarget: (h) => ({
      value: 1500,
      reference: 'center'
    })
  }
];

export const WALL_WIDTH = 4000; // mm representing the view area
export const WALL_HEIGHT = 2800; // mm representing the view area (Standard commercial ceiling)
export const DUAL_SCREEN_GAP = 20; // mm standard gap
