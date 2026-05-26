import React from "react";
import { Room } from "../types";
import { calculateRoomMetrics } from "../utils/calculations";

interface FloorBlueprintProps {
  rooms: Room[];
  selectedRoomId: string | null;
  activeFloor: 1 | 2;
  onSelectRoom: (roomId: string) => void;
}

export default function FloorBlueprint({
  rooms,
  selectedRoomId,
  activeFloor,
  onSelectRoom,
}: FloorBlueprintProps) {
  // Filter rooms belonging to the active floor
  const floorRooms = rooms.filter((r) => r.floor === activeFloor);

  // We can render a stylized grid that resembles a architectural floor plan.
  // Each room will have a coordinate/size representation for a grid or a beautiful flex layout.
  // Let's design a custom layout mapping:
  
  // Floor 1 Layout Mapping
  // A 3x3 layout represented by flexboxes or CSS Grid
  const getFloor1RoomClass = (id: string) => {
    switch (id) {
      case "vestibule-1": // Прихожая
        return "col-span-1 row-span-1 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/25";
      case "corridor-1": // Коридор-холл
        return "col-span-2 row-span-1 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/25";
      case "room-under-stair": // Под лестницей
        return "col-span-1 row-span-2 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/25";
      case "toilet-1": // Туалет
        return "col-span-1 row-span-1 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/25";
      case "boiler-1": // Котельная
        return "col-span-1 row-span-1 bg-red-500/10 border-red-500/30 hover:bg-red-500/25";
      case "utility-1": // Подсобка
        return "col-span-1 row-span-1 bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/25";
      default:
        return "col-span-1 row-span-1 bg-gray-500/10 border-gray-500/30 hover:bg-gray-500/25";
    }
  };

  // Floor 2 Layout Mapping
  const getFloor2RoomClass = (id: string) => {
    switch (id) {
      case "corridor-2": // Коридор №2
        return "col-span-3 row-span-1 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/25";
      case "room-2":
        return "col-span-1 row-span-2 bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/25";
      case "room-3":
        return "col-span-1 row-span-1 bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/25";
      case "room-4":
        return "col-span-1 row-span-2 bg-teal-500/10 border-teal-500/30 hover:bg-teal-500/25";
      case "room-5":
        return "col-span-1 row-span-1 bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/25";
      default:
        return "col-span-1 row-span-1 bg-gray-500/10 border-gray-500/30 hover:bg-gray-500/25";
    }
  };

  return (
    <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-850 relative overflow-hidden shadow-2xl">
      {/* Blueprint background grid effect */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none" 
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff .5px, transparent .5px), linear-gradient(to bottom, #ffffff .5px, transparent .5px)",
          backgroundSize: "20px 20px, 20px 20px, 20px 20px"
        }}
      />
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h3 className="font-semibold text-zinc-100 text-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Интерактивный чертеж этажа
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Выберите комнату на схеме для быстрого просмотра и редактирования размеров
          </p>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 py-1 px-2.5 rounded-full border border-emerald-500/25">
          {activeFloor} этаж
        </div>
      </div>

      {activeFloor === 1 ? (
        /* Floor 1 blueprint grid design (4x3 layout) */
        <div className="grid grid-cols-3 gap-3 h-80 relative z-10">
          {floorRooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const metrics = calculateRoomMetrics(room);
            const gridClass = getFloor1RoomClass(room.id);
            
            return (
              <button
                key={room.id}
                id={`blueprint-room-${room.id}`}
                onClick={() => onSelectRoom(room.id)}
                className={`group flex flex-col justify-between p-4 rounded-xl border text-left transition-all duration-300 relative cursor-pointer outline-none ${gridClass} ${
                  isSelected 
                    ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/15 shadow-lg shadow-emerald-500/10 scale-[0.99]" 
                    : "shadow-sm active:scale-95"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-tight group-hover:text-zinc-200 transition-colors">
                      {room.name === "Комната №1 под лестницей" ? "Комната №1" : room.name}
                    </span>
                    {room.isCustom && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded uppercase">
                        Своя
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5 group-hover:text-zinc-400">
                    {room.width.toFixed(1)}м × {room.length.toFixed(1)}м
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono tracking-tight text-zinc-100">
                    {metrics.floorArea.toFixed(1)}
                    <span className="text-xs font-normal text-zinc-400 ml-0.5">м²</span>
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-400">
                    h={room.height.toFixed(1)}м
                  </span>
                </div>

                {/* Wall thickness mockup effect inside Blueprint card */}
                <div className="absolute inset-0 border-[0.5px] border-zinc-700/10 rounded-xl pointer-events-none group-hover:border-zinc-500/20" />
              </button>
            );
          })}
        </div>
      ) : (
        /* Floor 2 blueprint grid design (3x3 grid) */
        <div className="grid grid-cols-3 gap-3 h-80 relative z-10">
          {floorRooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const metrics = calculateRoomMetrics(room);
            const gridClass = getFloor2RoomClass(room.id);

            return (
              <button
                key={room.id}
                id={`blueprint-room-${room.id}`}
                onClick={() => onSelectRoom(room.id)}
                className={`group flex flex-col justify-between p-4 rounded-xl border text-left transition-all duration-300 relative cursor-pointer outline-none ${gridClass} ${
                  isSelected 
                    ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/15 shadow-lg shadow-emerald-500/10 scale-[0.99]" 
                    : "shadow-sm active:scale-95"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-tight group-hover:text-zinc-200 transition-colors">
                      {room.name}
                    </span>
                    {room.isCustom && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded uppercase">
                        Своя
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5 group-hover:text-zinc-400">
                    {room.width.toFixed(1)}м × {room.length.toFixed(1)}м
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono tracking-tight text-zinc-100">
                    {metrics.floorArea.toFixed(1)}
                    <span className="text-xs font-normal text-zinc-400 ml-0.5">м²</span>
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-400">
                    h={room.height.toFixed(1)}м
                  </span>
                </div>

                <div className="absolute inset-0 border-[0.5px] border-zinc-700/10 rounded-xl pointer-events-none group-hover:border-zinc-500/20" />
              </button>
            );
          })}
        </div>
      )}

      {/* House stats widget inside Blueprint */}
      <div className="mt-5 pt-4 border-t border-zinc-900 flex justify-between items-center text-xs text-zinc-400 relative z-10">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500/30 border border-blue-500" />
            Коридоры
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500/30 border border-purple-500" />
            Сантехника
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500/30 border border-emerald-500" />
            Жилые
          </div>
        </div>
        <div className="text-zinc-500 text-[10px] font-mono">
          Клик по комнате выделяет её в списке снизу
        </div>
      </div>
    </div>
  );
}
