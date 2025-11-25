
export enum MeasurementUnit {
  MM = 'mm',
  INCH = 'inch'
}

export interface DisplayDimensions {
  width: number; // always stored in mm
  height: number; // always stored in mm
  depth?: number; // optional depth in mm
  diagonalInch?: number; // for label purposes
  name?: string;
}

export interface InstallationSpecs {
  afflValue: number; // value in mm
  referencePoint: 'center' | 'bottom'; // Is the AFFL value for the center or bottom?
}

export interface Preset {
  id: string;
  label: string;
  dimensions: DisplayDimensions;
}

export interface MountingBracket {
  id: string;
  label: string;
  modelName: string;
  width: number; // Wall plate/rail width in mm
  height: number; // Wall plate/rail height in mm
  depth: number; // Depth in mm
}

export type ScenarioType = 'general' | 'meeting-huddle' | 'meeting-conference' | 'video-conference' | 'education' | 'signage-interactive' | 'signage-passive' | 'home-theater';

export interface ValidationWarning {
  type: 'warning' | 'error';
  message: string;
}

export interface MountingScenario {
  id: ScenarioType;
  label: string;
  description: string;
  calculateTarget: (displayHeight: number) => { value: number; reference: 'center' | 'bottom' };
  validate?: (affl: number, displayHeight: number, reference: 'center' | 'bottom') => ValidationWarning | null;
}

export type ViewMode = 'front' | 'backing';

export type CameraPosition = 'top' | 'bottom';
