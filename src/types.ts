/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WindowLayout {
  id: string;
  width: number;  // meters
  height: number; // meters
  count: number;
}

export interface DoorLayout {
  id: string;
  width: number;  // meters
  height: number; // meters
  count: number;
}

export interface Room {
  id: string;
  name: string;
  floor: 1 | 2;
  width: number;   // meters
  length: number;  // meters
  height: number;  // meters
  windows: WindowLayout[];
  doors: DoorLayout[];
  isCustom?: boolean;
}

export interface MaterialEstimationSettings {
  wallpaper: {
    rollWidth: number;  // meters, e.g., 0.53, 1.06
    rollLength: number; // meters, e.g., 10.0
    patternRepeat: number; // meters, e.g., 0 for no repeat, 0.64 etc.
    wasteCoefficient: number; // multiplier, e.g., 1.10 (10%)
  };
  paint: {
    consumption: number; // g / m² per coat, e.g., 150
    coats: number; // count, e.g., 2
    density: number; // kg / L, e.g., 1.4 to calculate volume in liters
  };
  flooring: {
    packageArea: number; // m² per package, e.g., 2.1
    wasteCoefficient: number; // e.g. 1.05 (5%)
  };
  plinth: {
    unitLength: number; // meters, e.g., 2.5
    wasteCoefficient: number; // e.g., 1.07 (7%)
  };
  drywall: {
    sheetArea: number; // m² per sheet, e.g., 3.0 (1.2m x 2.5m)
  };
}
