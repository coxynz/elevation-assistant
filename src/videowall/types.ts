import { Flushbox } from '../types';

export interface DisplayPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  depth: number;
  weight: number;
  resX: number;
  resY: number;
}

export enum MountingReference {
  FLOOR_TO_TOP = 'floor_to_top',
  FLOOR_TO_CENTER = 'floor_to_center',
  FLOOR_TO_BOTTOM = 'floor_to_bottom'
}

export enum MountingSystemType {
  VOGELS_CONNECT_IT = 'vogels_connect_it'
}

export interface WallConfiguration {
  rows: number;
  cols: number;
  gap: number;
  mountingReference: MountingReference;
  mountingValue: number;
  display: DisplayPreset;
  mountingSystem: MountingSystemType;
}

export type ViewMode = 'front' | 'backing';

export type { Flushbox };

export interface WallDimensions {
  totalWidth: number;
  totalHeight: number;
  distanceToBottom: number;
  distanceToCenter: number;
  distanceToTop: number;
}