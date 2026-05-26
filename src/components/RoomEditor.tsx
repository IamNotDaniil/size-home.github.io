import React, { useState, useEffect } from "react";
import { Room, WindowLayout, DoorLayout } from "../types";
import { Trash2, Plus, RefreshCw, Layers, Check, Info } from "lucide-react";

interface RoomEditorProps {
  room: Room | null;
  onUpdateRoom: (updatedRoom: Room) => void;
  onResetRoom: (roomId: string) => void;
  onDeleteRoom?: (roomId: string) => void;
}

export default function RoomEditor({
  room,
  onUpdateRoom,
  onResetRoom,
  onDeleteRoom,
}: RoomEditorProps) {
  const [width, setWidth] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [windows, setWindows] = useState<WindowLayout[]>([]);
  const [doors, setDoors] = useState<DoorLayout[]>([]);

  // Synchronize with active room selection
  useEffect(() => {
    if (room) {
      setWidth(room.width);
      setLength(room.length);
      setHeight(room.height);
      setWindows(room.windows || []);
      setDoors(room.doors || []);
    }
  }, [room]);

  if (!room) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <Layers className="w-12 h-12 text-zinc-650 stroke-[1.5] mb-4 animate-pulse" />
        <h3 className="font-semibold text-zinc-350 text-base">Комната не выбрана</h3>
        <p className="text-xs text-zinc-500 max-w-xs mt-2">
          Выберите комнату на схеме выше или в списке, чтобы отредактировать размеры стен, окон и дверей.
        </p>
      </div>
    );
  }

  const handleApplyChanges = (
    newWidth = width,
    newLength = length,
    newHeight = height,
    newWindows = windows,
    newDoors = doors
  ) => {
    onUpdateRoom({
      ...room,
      width: Math.max(0.1, Number(newWidth)),
      length: Math.max(0.1, Number(newLength)),
      height: Math.max(0.1, Number(newHeight)),
      windows: newWindows,
      doors: newDoors,
    });
  };

  // Dimensions adjustment
  const handleDimChange = (field: "width" | "length" | "height", val: number) => {
    const cleanVal = isNaN(val) ? 0 : Number(val);
    if (field === "width") {
      setWidth(cleanVal);
      handleApplyChanges(cleanVal, length, height, windows, doors);
    } else if (field === "length") {
      setLength(cleanVal);
      handleApplyChanges(width, cleanVal, height, windows, doors);
    } else {
      setHeight(cleanVal);
      handleApplyChanges(width, length, cleanVal, windows, doors);
    }
  };

  // Add standard elements
  const addWindow = () => {
    const newWindow: WindowLayout = {
      id: `w-${Date.now()}`,
      width: 1.4,
      height: 1.4,
      count: 1,
    };
    const updated = [...windows, newWindow];
    setWindows(updated);
    handleApplyChanges(width, length, height, updated, doors);
  };

  const addDoor = () => {
    const newDoor: DoorLayout = {
      id: `d-${Date.now()}`,
      width: 0.8,
      height: 2.0,
      count: 1,
    };
    const updated = [...doors, newDoor];
    setDoors(updated);
    handleApplyChanges(width, length, height, windows, updated);
  };

  // Delete elements
  const removeWindow = (id: string) => {
    const updated = windows.filter((w) => w.id !== id);
    setWindows(updated);
    handleApplyChanges(width, length, height, updated, doors);
  };

  const removeDoor = (id: string) => {
    const updated = doors.filter((d) => d.id !== id);
    setDoors(updated);
    handleApplyChanges(width, length, height, windows, updated);
  };

  // Inline element updates
  const updateWindowItem = (id: string, updates: Partial<WindowLayout>) => {
    const updated = windows.map((w) => (w.id === id ? { ...w, ...updates } : w));
    setWindows(updated);
    handleApplyChanges(width, length, height, updated, doors);
  };

  const updateDoorItem = (id: string, updates: Partial<DoorLayout>) => {
    const updated = doors.map((d) => (d.id === id ? { ...d, ...updates } : d));
    setDoors(updated);
    handleApplyChanges(width, length, height, windows, updated);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden" id="room-editor">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 bg-emerald-500/10 py-0.5 px-2 rounded-full border border-emerald-500/20">
            {room.floor} этаж
          </span>
          <h3 className="font-semibold text-zinc-100 text-lg mt-1">{room.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            id={`reset-room-${room.id}`}
            onClick={() => onResetRoom(room.id)}
            title="Восстановить заводские размеры по умолчанию"
            className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {room.isCustom && onDeleteRoom && (
            <button
              id={`delete-room-${room.id}`}
              onClick={() => onDeleteRoom(room.id)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
              title="Удалить пользовательскую комнату"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* Core Dimensions */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 font-mono">
            Основные размеры комнаты (м)
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {/* Width */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850">
              <label htmlFor="dim-width" className="text-[10px] font-mono text-zinc-400 block mb-1">Ширина (A)</label>
              <div className="flex items-baseline gap-1">
                <input
                  id="dim-width"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={width || ""}
                  onChange={(e) => handleDimChange("width", parseFloat(e.target.value))}
                  className="w-full bg-transparent font-semibold font-mono text-zinc-100 text-lg border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs text-zinc-500 font-mono">м</span>
              </div>
              <input
                id="dim-width-slider"
                type="range"
                min="0.5"
                max="12"
                step="0.1"
                value={width || 3}
                onChange={(e) => handleDimChange("width", parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
              />
            </div>

            {/* Length */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850">
              <label htmlFor="dim-length" className="text-[10px] font-mono text-zinc-400 block mb-1">Длина (B)</label>
              <div className="flex items-baseline gap-1">
                <input
                  id="dim-length"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={length || ""}
                  onChange={(e) => handleDimChange("length", parseFloat(e.target.value))}
                  className="w-full bg-transparent font-semibold font-mono text-zinc-100 text-lg border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs text-zinc-500 font-mono">м</span>
              </div>
              <input
                id="dim-length-slider"
                type="range"
                min="0.5"
                max="12"
                step="0.1"
                value={length || 4}
                onChange={(e) => handleDimChange("length", parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
              />
            </div>

            {/* Height */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850">
              <label htmlFor="dim-height" className="text-[10px] font-mono text-zinc-400 block mb-1">Высота (H)</label>
              <div className="flex items-baseline gap-1">
                <input
                  id="dim-height"
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={height || ""}
                  onChange={(e) => handleDimChange("height", parseFloat(e.target.value))}
                  className="w-full bg-transparent font-semibold font-mono text-zinc-100 text-lg border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs text-zinc-500 font-mono">м</span>
              </div>
              <input
                id="dim-height-slider"
                type="range"
                min="1.0"
                max="4.5"
                step="0.1"
                value={height || 2.7}
                onChange={(e) => handleDimChange("height", parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
              />
            </div>
          </div>
        </div>

        {/* Windows Configuration */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Окна ({windows.reduce((acc, curr) => acc + curr.count, 0)})
            </h4>
            <button
              id="add-window"
              onClick={addWindow}
              className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/25 transition-all cursor-pointer font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Добавить
            </button>
          </div>

          {windows.length === 0 ? (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 text-center text-xs text-zinc-500">
              В этой комнате нет окон
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {windows.map((win) => (
                <div
                  key={win.id}
                  id={`window-item-${win.id}`}
                  className="bg-zinc-950 grid grid-cols-12 gap-2 p-2 rounded-xl border border-zinc-850 items-center"
                >
                  <div className="col-span-3">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Шир., м</span>
                    <input
                      id={`win-width-${win.id}`}
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={win.width}
                      onChange={(e) => updateWindowItem(win.id, { width: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="col-span-3">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Выс., м</span>
                    <input
                      id={`win-height-${win.id}`}
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={win.height}
                      onChange={(e) => updateWindowItem(win.id, { height: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="col-span-4">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-0.5">Кол-во</span>
                    <div className="flex items-center gap-1">
                      <button
                        id={`win-qty-dec-${win.id}`}
                        onClick={() => updateWindowItem(win.id, { count: Math.max(1, win.count - 1) })}
                        className="text-xs w-6 h-6 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold text-zinc-200 font-mono w-4 text-center">{win.count}</span>
                      <button
                        id={`win-qty-inc-${win.id}`}
                        onClick={() => updateWindowItem(win.id, { count: win.count + 1 })}
                        className="text-xs w-6 h-6 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      id={`delete-win-${win.id}`}
                      onClick={() => removeWindow(win.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doors Configuration */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Дверные проёмы ({doors.reduce((acc, curr) => acc + curr.count, 0)})
            </h4>
            <button
              id="add-door"
              onClick={addDoor}
              className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/25 transition-all cursor-pointer font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Добавить
            </button>
          </div>

          {doors.length === 0 ? (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 text-center text-xs text-zinc-500">
              В этой комнате нет дверей
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {doors.map((door) => (
                <div
                  key={door.id}
                  id={`door-item-${door.id}`}
                  className="bg-zinc-950 grid grid-cols-12 gap-2 p-2 rounded-xl border border-zinc-850 items-center"
                >
                  <div className="col-span-3">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Шир., м</span>
                    <input
                      id={`door-width-${door.id}`}
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={door.width}
                      onChange={(e) => updateDoorItem(door.id, { width: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="col-span-3">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Выс., м</span>
                    <input
                      id={`door-height-${door.id}`}
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={door.height}
                      onChange={(e) => updateDoorItem(door.id, { height: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="col-span-4">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-0.5">Кол-во</span>
                    <div className="flex items-center gap-1">
                      <button
                        id={`door-qty-dec-${door.id}`}
                        onClick={() => updateDoorItem(door.id, { count: Math.max(1, door.count - 1) })}
                        className="text-xs w-6 h-6 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold text-zinc-200 font-mono w-4 text-center">{door.count}</span>
                      <button
                        id={`door-qty-inc-${door.id}`}
                        onClick={() => updateDoorItem(door.id, { count: door.count + 1 })}
                        className="text-xs w-6 h-6 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      id={`delete-door-${door.id}`}
                      onClick={() => removeDoor(door.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/5 py-2 px-3 rounded-xl border border-emerald-500/10 font-mono">
        <Info className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Изменения сохраняются автоматически и пересчитывают всю таблицу.</span>
      </div>
    </div>
  );
}
