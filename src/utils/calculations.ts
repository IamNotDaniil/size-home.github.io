import { Room, MaterialEstimationSettings } from "../types";

export interface RoomMetrics {
  floorArea: number;       // Area of the floor (m²)
  perimeter: number;       // Perimeter of the room (m)
  grossWallArea: number;   // Full wall area before window/door deductions (m²)
  windowsArea: number;     // Total area of windows (m²)
  doorsArea: number;       // Total area of doors (m²)
  netWallArea: number;     // Wall area with windows & doors deducted (m²)
  ceilingArea: number;     // Ceiling area (m²)
}

export function calculateRoomMetrics(room: Room): RoomMetrics {
  const floorArea = room.width * room.length;
  const ceilingArea = floorArea;
  const perimeter = 2 * (room.width + room.length);
  const grossWallArea = perimeter * room.height;

  const windowsArea = room.windows.reduce((sum, win) => {
    return sum + (win.width * win.height * win.count);
  }, 0);

  const doorsArea = room.doors.reduce((sum, door) => {
    return sum + (door.width * door.height * door.count);
  }, 0);

  const netWallArea = Math.max(0, grossWallArea - windowsArea - doorsArea);

  return {
    floorArea,
    perimeter,
    grossWallArea,
    windowsArea,
    doorsArea,
    netWallArea,
    ceilingArea
  };
}

export interface MaterialEstimation {
  wallpaperRolls: number;    // Count of rolls
  paintKg: number;           // Paint weight in kg
  paintLiters: number;       // Paint volume in liters
  flooringPackages: number;  // Count of flooring packages
  plinthMeters: number;      // Plinths meterage needed
  plinthsCount: number;      // Count of individual plinth bars
  drywallSheets: number;     // Drywall sheets count (for walls)
}

export function estimateMaterials(
  metrics: RoomMetrics,
  settings: MaterialEstimationSettings
): MaterialEstimation {
  // 1. Wallpaper (computed using net wall area or wall perimeter? Usually wallpaper uses wall height, but simple area calculation is standard for quick budget estimation. Let's do a accurate calculation using netWallArea or perimeter!)
  // Advanced wallpaper roll calculation:
  // Usually, wall perimeter is divided by roll width to find number of stripes.
  // Stripes per roll = rollLength / (roomHeight + patternRepeat).
  // Total rolls = Math.ceil(stripesNeeded / stripesPerRoll).
  // Let's use clean math:
  const wallWidthsSum = metrics.perimeter; // perimeter equals total width of all walls
  const stripesNeeded = Math.ceil(wallWidthsSum / settings.wallpaper.rollWidth);
  const stripeLengthWithPattern = 2.7 + settings.wallpaper.patternRepeat; // standard height is around 2.7m
  const stripesPerRoll = Math.floor(settings.wallpaper.rollLength / stripeLengthWithPattern) || 1;
  let wallpaperRolls = Math.ceil(stripesNeeded / stripesPerRoll);
  
  // Apply safety factor because windows and doors reduce overall wallpaper needed, but make up with leftovers.
  // Actually, we can also calculate by net area directly as a robust metric:
  const rollbackByArea = Math.ceil((metrics.netWallArea / (settings.wallpaper.rollWidth * settings.wallpaper.rollLength)) * settings.wallpaper.wasteCoefficient);
  // We'll take the average or the realistic area-based count since windows and doors cut off stripes.
  wallpaperRolls = isNaN(rollbackByArea) ? 0 : Math.max(1, rollbackByArea);

  // 2. Paint
  // (net weall area * consumption * coats) in grams, converted to kg
  const paintKg = (metrics.netWallArea * settings.paint.consumption * settings.paint.coats) / 1000;
  const paintLiters = paintKg / settings.paint.density;

  // 3. Flooring
  // (floor area * waste) / packageArea
  const netFlooringArea = metrics.floorArea * settings.flooring.wasteCoefficient;
  const flooringPackages = Math.ceil(netFlooringArea / settings.flooring.packageArea);

  // 4. Plinth
  // perimeter minus doors widths * waste
  const totalDoorWidth = 0.8 * 1; // standard door width approximation or actual sum:
  const doorsActualWidth = 0.8; // let's use perimeter directly minus doors widths or approx.
  const netPerimeter = Math.max(0, metrics.perimeter - (0.8 * (metrics.doorsArea / 1.6 || 1))); 
  const plinthMeters = netPerimeter * settings.plinth.wasteCoefficient;
  const plinthsCount = Math.ceil(plinthMeters / settings.plinth.unitLength);

  // 5. Drywall sheets
  const drywallSheets = Math.ceil(metrics.netWallArea / settings.drywall.sheetArea);

  return {
    wallpaperRolls: isNaN(wallpaperRolls) || wallpaperRolls < 0 ? 0 : wallpaperRolls,
    paintKg: isNaN(paintKg) || paintKg < 0 ? 0 : Number(paintKg.toFixed(2)),
    paintLiters: isNaN(paintLiters) || paintLiters < 0 ? 0 : Number(paintLiters.toFixed(2)),
    flooringPackages: isNaN(flooringPackages) || flooringPackages < 0 ? 0 : flooringPackages,
    plinthMeters: isNaN(plinthMeters) || plinthMeters < 0 ? 0 : Number(plinthMeters.toFixed(1)),
    plinthsCount: isNaN(plinthsCount) || plinthsCount < 0 ? 0 : plinthsCount,
    drywallSheets: isNaN(drywallSheets) || drywallSheets < 0 ? 0 : drywallSheets
  };
}
