import React, { useState } from "react";
import { Room, MaterialEstimationSettings } from "../types";
import { calculateRoomMetrics, estimateMaterials, RoomMetrics } from "../utils/calculations";
import { Settings, Sparkles, Paintbrush, Hammer, Clipboard, AlignLeft, Grid, FilePlus } from "lucide-react";

interface MaterialEstimatorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  settings: MaterialEstimationSettings;
  onUpdateSettings: (settings: MaterialEstimationSettings) => void;
}

export default function MaterialEstimatorPanel({
  rooms,
  selectedRoom,
  settings,
  onUpdateSettings,
}: MaterialEstimatorProps) {
  const [activeTab, setActiveTab] = useState<"selected" | "all">("selected");
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Compute metrics for selected room
  const selectedMetrics: RoomMetrics | null = selectedRoom ? calculateRoomMetrics(selectedRoom) : null;
  const selectedEstimation = selectedMetrics ? estimateMaterials(selectedMetrics, settings) : null;

  // Compute aggregate metrics for all rooms
  const allRoomsMetrics = rooms.map(calculateRoomMetrics);
  
  // To compound aggregate estimates correctly, we aggregate room-by-room estimates (because of ceiling package rounding or wallpaper roll rounding)
  const compoundEstimation = rooms.reduce(
    (acc, room) => {
      const rm = calculateRoomMetrics(room);
      const est = estimateMaterials(rm, settings);
      
      return {
        totalNetWallArea: acc.totalNetWallArea + rm.netWallArea,
        totalFloorArea: acc.totalFloorArea + rm.floorArea,
        totalPerimeter: acc.totalPerimeter + rm.perimeter,
        wallpaperRolls: acc.wallpaperRolls + est.wallpaperRolls,
        paintKg: acc.paintKg + est.paintKg,
        paintLiters: acc.paintLiters + est.paintLiters,
        flooringPackages: acc.flooringPackages + est.flooringPackages,
        plinthMeters: acc.plinthMeters + est.plinthMeters,
        plinthsCount: acc.plinthsCount + est.plinthsCount,
        drywallSheets: acc.drywallSheets + est.drywallSheets,
      };
    },
    {
      totalNetWallArea: 0,
      totalFloorArea: 0,
      totalPerimeter: 0,
      wallpaperRolls: 0,
      paintKg: 0,
      paintLiters: 0,
      flooringPackages: 0,
      plinthMeters: 0,
      plinthsCount: 0,
      drywallSheets: 0,
    }
  );

  const handleSettingChange = (category: keyof MaterialEstimationSettings, field: string, value: number) => {
    onUpdateSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: Number(value),
      },
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl relative" id="material-estimator">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-semibold text-zinc-100 text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            Калькулятор материалов
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Примерный объем стройматериалов для закупки с учетом запаса
          </p>
        </div>
        <button
          id="toggle-calc-settings"
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
            showSettings
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-zinc-850 text-zinc-350 border-zinc-800 hover:text-zinc-100 hover:bg-zinc-800"
          }`}
        >
          <Settings className={`w-3.5 h-3.5 ${showSettings ? 'animate-spin' : ''}`} />
          Настройки
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Wallpaper */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-zinc-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Обои (рулон)
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="wall-width-set" className="text-zinc-500 text-[10px] block mb-0.5">Ширина рулона (м)</label>
                <select
                  id="wall-width-set"
                  value={settings.wallpaper.rollWidth}
                  onChange={(e) => handleSettingChange("wallpaper", "rollWidth", parseFloat(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                >
                  <option value="0.53">0.53 м (узкие)</option>
                  <option value="1.06">1.06 м (метровые)</option>
                </select>
              </div>
              <div>
                <label htmlFor="wall-length-set" className="text-zinc-500 text-[10px] block mb-0.5">Длина рулона (м)</label>
                <input
                  id="wall-length-set"
                  type="number"
                  step="0.5"
                  value={settings.wallpaper.rollLength}
                  onChange={(e) => handleSettingChange("wallpaper", "rollLength", parseFloat(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-between">
              <div>
                <label htmlFor="wall-repeat-set" className="text-zinc-500 text-[10px] block mb-0.5">Раппорт / раппорт (м)</label>
                <input
                  id="wall-repeat-set"
                  type="number"
                  step="0.05"
                  value={settings.wallpaper.patternRepeat}
                  onChange={(e) => handleSettingChange("wallpaper", "patternRepeat", parseFloat(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                />
              </div>
              <div>
                <label htmlFor="wall-coef-set" className="text-zinc-500 text-[10px] block mb-0.5">Коэффициент запаса</label>
                <input
                  id="wall-coef-set"
                  type="number"
                  step="0.05"
                  value={settings.wallpaper.wasteCoefficient}
                  onChange={(e) => handleSettingChange("wallpaper", "wasteCoefficient", parseFloat(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Paint */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-zinc-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Краска для стен
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="paint-consump-set" className="text-zinc-500 text-[10px] block mb-0.5">Расход (г/м² на слой)</label>
                <input
                  id="paint-consump-set"
                  type="number"
                  step="10"
                  value={settings.paint.consumption}
                  onChange={(e) => handleSettingChange("paint", "consumption", parseInt(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                />
              </div>
              <div>
                <label htmlFor="paint-coats-set" className="text-zinc-500 text-[10px] block mb-0.5">Кол-во слоев</label>
                <input
                  id="paint-coats-set"
                  type="number"
                  min="1"
                  max="5"
                  value={settings.paint.coats}
                  onChange={(e) => handleSettingChange("paint", "coats", parseInt(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Flooring */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-zinc-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Напольные покрытия
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="floor-pack-set" className="text-zinc-500 text-[10px] block mb-0.5">Площадь уп. (м²)</label>
                <input
                  id="floor-pack-set"
                  type="number"
                  step="0.05"
                  value={settings.flooring.packageArea}
                  onChange={(e) => handleSettingChange("flooring", "packageArea", parseFloat(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                />
              </div>
              <div>
                <label htmlFor="floor-coef-set" className="text-zinc-500 text-[10px] block mb-0.5">Запас (коэф.)</label>
                <input
                  id="floor-coef-set"
                  type="number"
                  step="0.01"
                  value={settings.flooring.wasteCoefficient}
                  onChange={(e) => handleSettingChange("flooring", "wasteCoefficient", parseFloat(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Plinth */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-zinc-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Плинтус
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="plinth-len-set" className="text-zinc-500 text-[10px] block mb-0.5">Длина планки (м)</label>
                <input
                  id="plinth-len-set"
                  type="number"
                  step="0.1"
                  value={settings.plinth.unitLength}
                  onChange={(e) => handleSettingChange("plinth", "unitLength", parseFloat(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                />
              </div>
              <div>
                <label htmlFor="plinth-coef-set" className="text-zinc-500 text-[10px] block mb-0.5">Запас (коэф.)</label>
                <input
                  id="plinth-coef-set"
                  type="number"
                  step="0.01"
                  value={settings.plinth.wasteCoefficient}
                  onChange={(e) => handleSettingChange("plinth", "wasteCoefficient", parseFloat(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 mb-6">
        <button
          id="tab-selected-estim"
          onClick={() => setActiveTab("selected")}
          className={`pb-3 pr-4 text-sm font-semibold relative transition-colors cursor-pointer ${
            activeTab === "selected" ? "text-emerald-400" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {activeTab === "selected" && (
            <span className="absolute bottom-0 left-0 right-4 h-0.5 bg-emerald-500 rounded-full" />
          )}
          {selectedRoom ? selectedRoom.name : "Выбранная комната"}
        </button>
        <button
          id="tab-all-estim"
          onClick={() => setActiveTab("all")}
          className={`pb-3 px-4 text-sm font-semibold relative transition-colors cursor-pointer ${
            activeTab === "all" ? "text-emerald-400" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {activeTab === "all" && (
            <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-500 rounded-full" />
          )}
          Весь дом (итог)
        </button>
      </div>

      {activeTab === "selected" && !selectedRoom && (
        <div className="text-center py-12 text-xs text-zinc-500">
          Выберите комнату, чтобы увидеть расчет ее материалов
        </div>
      )}

      {/* Estimations Output Grid */}
      {((activeTab === "selected" && selectedRoom && selectedEstimation) || activeTab === "all") && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Wall Paint Card */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 flex flex-col justify-between relative group hover:border-blue-500/20 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs text-zinc-400 font-medium">Краска для стен</span>
              <Paintbrush className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold font-mono text-zinc-100 tracking-tight">
                {activeTab === "selected" ? selectedEstimation?.paintLiters : compoundEstimation.paintLiters.toFixed(1)}
                <span className="text-xs font-normal text-zinc-400 ml-0.5">л</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-1">
                (~{activeTab === "selected" ? selectedEstimation?.paintKg : compoundEstimation.paintKg.toFixed(1)} кг в {settings.paint.coats} слоя)
              </div>
            </div>
          </div>

          {/* Wallpaper Rolls Card */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 flex flex-col justify-between relative group hover:border-emerald-500/20 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs text-zinc-400 font-medium">Обои</span>
              <AlignLeft className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold font-mono text-zinc-100 tracking-tight">
                {activeTab === "selected" ? selectedEstimation?.wallpaperRolls : compoundEstimation.wallpaperRolls}
                <span className="text-xs font-normal text-zinc-400 ml-0.5">рул.</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-1">
                ({settings.wallpaper.rollWidth}м × {settings.wallpaper.rollLength}м)
              </div>
            </div>
          </div>

          {/* Flooring Package Card */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 flex flex-col justify-between relative group hover:border-purple-500/20 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs text-zinc-400 font-medium">Ламинат / Пол</span>
              <Grid className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold font-mono text-zinc-100 tracking-tight">
                {activeTab === "selected" ? selectedEstimation?.flooringPackages : compoundEstimation.flooringPackages}
                <span className="text-xs font-normal text-zinc-400 ml-0.5">упак.</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-1">
                (уп = {settings.flooring.packageArea}м² + {Math.round((settings.flooring.wasteCoefficient - 1) * 100)}% запас)
              </div>
            </div>
          </div>

          {/* Plinths Card */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 flex flex-col justify-between relative group hover:border-amber-500/20 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs text-zinc-400 font-medium">Плинтусы</span>
              <Clipboard className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold font-mono text-zinc-100 tracking-tight">
                {activeTab === "selected" ? selectedEstimation?.plinthsCount : compoundEstimation.plinthsCount}
                <span className="text-xs font-normal text-zinc-400 ml-0.5">шт</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-1">
                (~{activeTab === "selected" ? selectedEstimation?.plinthMeters : compoundEstimation.plinthMeters.toFixed(1)} м.п, планки {settings.plinth.unitLength}м)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contextual warning or advice */}
      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850/50 mt-5 flex gap-3 text-xs text-zinc-400 items-start">
        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-zinc-200">Примечание прораба: </span>
          {activeTab === "selected" ? (
            <span>
              Для этой комнаты ({selectedRoom?.name}) расчет произведен за вычетом площадей оконных и дверных проемов ({selectedMetrics?.windowsArea.toFixed(1)}м² и {selectedMetrics?.doorsArea.toFixed(1)}м²).
            </span>
          ) : (
            <span>
              Расчет для всего дома ({rooms.length} комнат) суммирует округления упаковок по каждой отдельной комнате, что предотвратит нехватку материалов из-за обрезков в разных помещениях. Общая чистая площадь стен под отделку: {compoundEstimation.totalNetWallArea.toFixed(1)}м².
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
