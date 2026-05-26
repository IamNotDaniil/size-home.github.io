/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Room, MaterialEstimationSettings } from "./types";
import { initialRooms, defaultEstimationSettings } from "./initialData";
import { calculateRoomMetrics, estimateMaterials } from "./utils/calculations";

import FloorBlueprint from "./components/FloorBlueprint";
import RoomEditor from "./components/RoomEditor";
import MaterialEstimatorPanel from "./components/MaterialEstimatorPanel";

import {
  Home,
  Plus,
  Trash2,
  Copy,
  Printer,
  Download,
  RefreshCw,
  Search,
  Check,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ChevronRight,
  Info,
  HelpCircle,
  X
} from "lucide-react";

export default function App() {
  // --- STATE WITH IMMUTABILITY & SOLID DEFENSIVENESS ---
  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem("house_rooms_data_v1");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Local storage lookup failed, using default values", e);
    }
    return initialRooms;
  });

  const [settings, setSettings] = useState<MaterialEstimationSettings>(() => {
    try {
      const saved = localStorage.getItem("material_estimation_settings_v1");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Local storage settings recovery failed", e);
    }
    return defaultEstimationSettings;
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>("vestibule-1");
  const [activeFloorBlueprint, setActiveFloorBlueprint] = useState<1 | 2>(1);
  const [filterFloor, setFilterFloor] = useState<"all" | 1 | 2>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Custom room added form
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newRoomName, setNewRoomName] = useState<string>("");
  const [newRoomFloor, setNewRoomFloor] = useState<1 | 2>(1);
  const [newRoomWidth, setNewRoomWidth] = useState<number>(3.5);
  const [newRoomLength, setNewRoomLength] = useState<number>(4.0);
  const [newRoomHeight, setNewRoomHeight] = useState<number>(2.7);

  // Clipboard copies visual feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Sync to local storage safely
  useEffect(() => {
    try {
      localStorage.setItem("house_rooms_data_v1", JSON.stringify(rooms));
    } catch (e) {
      console.warn("Could not save rooms data to local storage", e);
    }
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem("material_estimation_settings_v1", JSON.stringify(settings));
    } catch (e) {
      console.warn("Could not save settings data to local storage", e);
    }
  }, [settings]);

  // Selected room details
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || null;

  // --- HANDLERS & MODIFIERS ---
  const handleUpdateRoom = (updatedRoom: Room) => {
    setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
  };

  const handleResetRoom = (roomId: string) => {
    const original = initialRooms.find((r) => r.id === roomId);
    if (original) {
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...original } : r)));
    }
  };

  const handleResetAllToFactory = () => {
    if (window.confirm("Вы уверены, что хотите сбросить ВСЕ размеры и удалить свои комнаты?")) {
      setRooms(JSON.parse(JSON.stringify(initialRooms)));
      setSettings({ ...defaultEstimationSettings });
      setSelectedRoomId("vestibule-1");
      setActiveFloorBlueprint(1);
      setFilterFloor("all");
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    if (selectedRoomId === roomId) {
      const remaining = rooms.filter((r) => r.id !== roomId);
      setSelectedRoomId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleAddCustomRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const newRoom: Room = {
      id: `custom-room-${Date.now()}`,
      name: newRoomName.trim(),
      floor: newRoomFloor,
      width: Math.max(0.1, newRoomWidth),
      length: Math.max(0.1, newRoomLength),
      height: Math.max(0.1, newRoomHeight),
      windows: [
        { id: `w-${Date.now()}`, width: 1.4, height: 1.4, count: 1 }
      ],
      doors: [
        { id: `d-${Date.now()}`, width: 0.8, height: 2.0, count: 1 }
      ],
      isCustom: true
    };

    setRooms((prev) => [...prev, newRoom]);
    setSelectedRoomId(newRoom.id);
    setActiveFloorBlueprint(newRoomFloor);
    setShowAddForm(false);
    
    // Reset form field states
    setNewRoomName("");
    setNewRoomWidth(3.5);
    setNewRoomLength(4.0);
    setNewRoomHeight(2.7);
  };

  // Select room from layout or table
  const handleSelectRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      setSelectedRoomId(roomId);
      setActiveFloorBlueprint(room.floor);
    }
  };

  // Floor stats aggregation
  const totalFloorArea = rooms.reduce((acc, curr) => acc + (curr.width * curr.length), 0);
  const totalNetWallArea = rooms.reduce((acc, curr) => {
    const metrics = calculateRoomMetrics(curr);
    return acc + metrics.netWallArea;
  }, 0);
  const totalWindows = rooms.reduce((acc, curr) => {
    return acc + curr.windows.reduce((wAcc, w) => wAcc + w.count, 0);
  }, 0);
  const totalDoors = rooms.reduce((acc, curr) => {
    return acc + curr.doors.reduce((dAcc, d) => dAcc + d.count, 0);
  }, 0);

  // Filtering logic
  const filteredRooms = rooms.filter((room) => {
    const matchesFloor = filterFloor === "all" || room.floor === filterFloor;
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFloor && matchesSearch;
  });

  // --- EXPORTS & REVENUE LAYOUT HELPERS ---
  const handleExportCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM representation for correct Excel cyrillic display
    csvContent += "Этаж;Название помещения;Ширина комнаты (м);Длина комнаты (м);Высота потолков (м);Площадь пола (кв.м);Периметр пола (м);Общая площадь стен (кв.м);Площадь окон (кв.м);Площадь дверей (кв.м);Чистая площадь стен под отделку (кв.м)\n";
    
    rooms.forEach((room) => {
      const m = calculateRoomMetrics(room);
      csvContent += `${room.floor};${room.name};${room.width.toFixed(2)};${room.length.toFixed(2)};${room.height.toFixed(2)};${m.floorArea.toFixed(2)};${m.perimeter.toFixed(2)};${m.grossWallArea.toFixed(2)};${m.windowsArea.toFixed(2)};${m.doorsArea.toFixed(2)};${m.netWallArea.toFixed(2)}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `House_Dimensions_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyAllToClipboard = () => {
    let text = "СПЕЦИФИКАЦИЯ РАЗМЕРОВ КОМНАТ:\n\n";
    rooms.forEach((room) => {
      const m = calculateRoomMetrics(room);
      text += `${room.floor} этаж | Помещение: ${room.name}\n`;
      text += `  • Габариты: ${room.width.toFixed(2)}м × ${room.length.toFixed(2)}м × h=${room.height.toFixed(2)}м\n`;
      text += `  • Площадь пола: ${m.floorArea.toFixed(2)} м² | Периметр пола: ${m.perimeter.toFixed(2)} м\n`;
      text += `  • Площадь оконных проемов: ${m.windowsArea.toFixed(2)} м²\n`;
      text += `  • Площадь дверных проемов: ${m.doorsArea.toFixed(2)} м²\n`;
      text += `  • Чистая площадь стен под шпаклевку/обои: ${m.netWallArea.toFixed(2)} м²\n`;
      text += "----------------------------------------\n";
    });

    text += `\nИТОГО ПО ВСЕМУ ДОМУ:\n`;
    text += `- Суммарная площадь полов: ${totalFloorArea.toFixed(2)} м²\n`;
    text += `- Чистая площадь отделки стен: ${totalNetWallArea.toFixed(2)} м²\n`;
    text += `- Количество окон: ${totalWindows}\n`;

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyRow = (room: Room) => {
    const m = calculateRoomMetrics(room);
    const text = `${room.name} (${room.floor} этаж)
Габариты: ${room.width.toFixed(2)}м × ${room.length.toFixed(2)}м × h=${room.height.toFixed(2)}м
Площадь пола: ${m.floorArea.toFixed(2)} м²
Периметр: ${m.perimeter.toFixed(2)} м
Проёмы: Окна (${m.windowsArea.toFixed(2)} м²), Двери (${m.doorsArea.toFixed(2)} м²)
Чистая площадь стен: ${m.netWallArea.toFixed(2)} м²`;

    navigator.clipboard.writeText(text);
    setCopiedId(room.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 font-sans tracking-normal pb-20">
      {/* Dynamic Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 print-hide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-zinc-50 font-sans tracking-tight leading-tight text-base sm:text-lg">
                Таблица размеров комнат дома
              </h1>
              <p className="text-[10px] sm:text-xs text-zinc-400 font-mono mt-0.5">
                Итоги отделки полов, стен, дверей и оконных проёмов
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              id="reset-all-system-factory"
              onClick={handleResetAllToFactory}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 p-2 rounded-lg hover:bg-zinc-900 transition-all cursor-pointer font-medium"
              title="Сбросить все размеры"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Сбросить всё</span>
            </button>
            <button
              id="print-full-sizes-doc"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-100 p-2 rounded-lg hover:bg-zinc-900 transition-all cursor-pointer font-medium"
              title="Печать отчета по размерам"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Печать</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 lg:mt-8 space-y-6">
        
        {/* TOP METRICS STRIP: Interactive Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 print-hide">
          {/* Card 1: Total Floors Area */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl relative overflow-hidden group hover:border-emerald-500/20 transition-all">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tight block">Площадь полов дома</span>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-zinc-100 mt-2">
              {totalFloorArea.toFixed(1)}
              <span className="text-sm font-normal text-zinc-400 ml-1">м²</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              11 помещений на 2-х этажах
            </p>
            <div className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-emerald-500/5 flex items-center justify-center text-emerald-400/20 group-hover:text-emerald-400/40 transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Total Walls Surface */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl relative overflow-hidden group hover:border-emerald-500/20 transition-all">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tight block">Чистая площадь стен</span>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-zinc-100 mt-2">
              {totalNetWallArea.toFixed(1)}
              <span className="text-sm font-normal text-zinc-400 ml-1">м²</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3 text-emerald-500" />
              Исключены окна и дверные коробки
            </p>
            <div className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-blue-500/5 flex items-center justify-center text-blue-400/20 group-hover:text-blue-400/40 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Total Windows Area */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl relative overflow-hidden group hover:border-emerald-500/20 transition-all">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tight block">Оконные проёмы</span>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-zinc-100 mt-2">
              {totalWindows}
              <span className="text-sm font-normal text-zinc-400 ml-1.5">окон</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              Для естественной вентиляции комнат
            </p>
            <div className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-500/20 group-hover:text-amber-500/40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: Total Doors */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl relative overflow-hidden group hover:border-emerald-500/20 transition-all">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tight block">Дверные проёмы</span>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-zinc-100 mt-2">
              {totalDoors}
              <span className="text-sm font-normal text-zinc-400 ml-1.5">дверей</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              Коробки и входы в помещения
            </p>
          </div>
        </section>

        {/* REPAIR CONFIG SECTION: BLUEPRINT & EDITOR CO-WORK */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 print-hide">
          {/* Left panel: Interactive Floor Map Block */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Visual Floor Selector */}
            <div className="bg-zinc-900 border border-zinc-850 p-2 rounded-2xl flex gap-1">
              <button
                id="floor-1-selector-tab"
                type="button"
                onClick={() => setActiveFloorBlueprint(1)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeFloorBlueprint === 1
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/15"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
                }`}
              >
                1 Этаж (Прихожая, Холл, Подсобки)
              </button>
              <button
                id="floor-2-selector-tab"
                type="button"
                onClick={() => setActiveFloorBlueprint(2)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeFloorBlueprint === 2
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/15"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
                }`}
              >
                2 Этаж (Коридор, Жилые комнаты)
              </button>
            </div>

            <FloorBlueprint
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              activeFloor={activeFloorBlueprint}
              onSelectRoom={handleSelectRoom}
            />
          </div>

          {/* Right panel: Active Room Properties Editor Block */}
          <div className="lg:col-span-5">
            <RoomEditor
              room={selectedRoom}
              onUpdateRoom={handleUpdateRoom}
              onResetRoom={handleResetRoom}
              onDeleteRoom={handleDeleteRoom}
            />
          </div>
        </section>

        {/* TABULAR LAYOUT FOR DETAIL ACCURACY: The Room Sizes Spreadsheet */}
        <section className="bg-zinc-900 border border-zinc-850 rounded-3xl p-6 shadow-xl relative overflow-hidden print-container">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 print-hide">
            <div>
              <h3 className="font-bold text-zinc-50 text-base sm:text-lg flex items-center gap-2">
                Сводная спецификация помещений
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Полный список комнат дома с детальными характеристиками площадей
              </p>
            </div>

            {/* Controls panel: Search, Filter, Add */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="search-rooms-input"
                  type="text"
                  placeholder="Поиск по названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-950 border border-zinc-850 text-xs text-zinc-100 rounded-xl py-2 pl-9 pr-4 w-full sm:w-48 focus:outline-none focus:border-zinc-700"
                />
              </div>

              {/* Filter switch */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850">
                <button
                  id="filter-floor-all"
                  onClick={() => setFilterFloor("all")}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    filterFloor === "all" ? "bg-zinc-850 text-zinc-100 font-semibold" : "text-zinc-500 hover:text-zinc-350"
                  }`}
                >
                  Все
                </button>
                <button
                  id="filter-floor-1"
                  onClick={() => setFilterFloor(1)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    filterFloor === 1 ? "bg-zinc-850 text-zinc-100 font-semibold" : "text-zinc-500 hover:text-zinc-350"
                  }`}
                >
                  1 эт.
                </button>
                <button
                  id="filter-floor-2"
                  onClick={() => setFilterFloor(2)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    filterFloor === 2 ? "bg-zinc-850 text-zinc-100 font-semibold" : "text-zinc-500 hover:text-zinc-350"
                  }`}
                >
                  2 эт.
                </button>
              </div>

              {/* Add Custom Room selector trigger */}
              <button
                id="btn-show-add-form"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 py-2 px-3 rounded-xl border border-emerald-500/25 transition-all font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Комната
              </button>
            </div>
          </div>

          {/* Add custom room inline modal-like form */}
          {showAddForm && (
            <form
              id="add-custom-room-form"
              onSubmit={handleAddCustomRoom}
              className="bg-zinc-950 border border-zinc-850 rounded-2xl p-5 mb-6 space-y-4 text-xs animate-in fade-in zoom-in duration-200"
            >
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold text-zinc-300 uppercase tracking-wider font-mono">Добавить новое помещение</h4>
                <button
                  id="btn-close-add-form"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label htmlFor="custom-room-name-inp" className="text-zinc-400 block mb-1">Название помещения</label>
                  <input
                    id="custom-room-name-inp"
                    type="text"
                    required
                    placeholder="Напр. Комната №6, Бильярдная"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="custom-room-floor-inp" className="text-zinc-400 block mb-1">Этаж</label>
                  <select
                    id="custom-room-floor-inp"
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(parseInt(e.target.value) as 1 | 2)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1">1 этаж</option>
                    <option value="2">2 этаж</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="custom-room-width-inp" className="text-zinc-400 block mb-1">Ширина (A), м</label>
                  <input
                    id="custom-room-width-inp"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newRoomWidth}
                    onChange={(e) => setNewRoomWidth(parseFloat(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 font-mono focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="custom-room-length-inp" className="text-zinc-400 block mb-1">Длина (B), м</label>
                  <input
                    id="custom-room-length-inp"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newRoomLength}
                    onChange={(e) => setNewRoomLength(parseFloat(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 font-mono focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="custom-room-height-inp" className="text-zinc-400 block mb-1">Высота (H), м</label>
                  <input
                    id="custom-room-height-inp"
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={newRoomHeight}
                    onChange={(e) => setNewRoomHeight(parseFloat(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  id="cancel-add-custom-btn"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-zinc-900 text-zinc-400 hover:text-zinc-200 py-2 px-4 rounded-xl font-medium cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  id="submit-add-custom-btn"
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold py-2 px-5 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  Добавить помещение
                </button>
              </div>
            </form>
          )}

          {/* Table Spreadsheet wrapper with responsive horizontal overflow layout */}
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left text-sm" id="rooms-specification-table">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Помещение / Этаж</th>
                  <th className="py-3 px-4 font-semibold">Габариты (м)</th>
                  <th className="py-3 px-4 font-semibold text-right">Площадь пола (м²)</th>
                  <th className="py-3 px-4 font-semibold text-right">Периметр (м)</th>
                  <th className="py-3 px-4 font-semibold text-right">Площадь стен без изменений (м²)</th>
                  <th className="py-3 px-4 font-semibold text-right">Стена с Окном (выч., м²)</th>
                  <th className="py-3 px-4 font-semibold text-right">Стена с Дверью (выч., м²)</th>
                  <th className="py-3 px-4 font-semibold text-right text-emerald-400">Стены под отделку (м²)</th>
                  <th className="py-3 px-4 text-center font-semibold text-zinc-500 print-hide">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-xs text-zinc-500 font-mono">
                      Нет помещений, соответствующих фильтрам
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => {
                    const metrics = calculateRoomMetrics(room);
                    const isSelected = selectedRoomId === room.id;
                    
                    return (
                      <tr
                        key={room.id}
                        id={`room-row-${room.id}`}
                        onClick={() => handleSelectRoom(room.id)}
                        className={`hover:bg-zinc-850/40 group transition-all duration-200 cursor-pointer text-xs ${
                          isSelected ? "bg-emerald-500/5 text-zinc-100" : "text-zinc-300"
                        }`}
                      >
                        {/* Name & floor index */}
                        <td className="py-3.5 px-4 font-medium">
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            )}
                            <div>
                              <div className="font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                                {room.name}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                {room.floor} этаж {room.isCustom && <span className="text-emerald-500 font-bold ml-1">СВОЯ</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Dimensions config */}
                        <td className="py-3.5 px-4 font-mono select-all">
                          {room.width.toFixed(2)} × {room.length.toFixed(2)} × {room.height.toFixed(2)}
                        </td>

                        {/* Floor Area */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-200">
                          {metrics.floorArea.toFixed(2)}
                        </td>

                        {/* Perimeter */}
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-400">
                          {metrics.perimeter.toFixed(2)}
                        </td>

                        {/* Gross walls area requested as "площадь стены" */}
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-400">
                          {metrics.grossWallArea.toFixed(2)}
                        </td>

                        {/* Window deduction area requested as "площадь стены с окном" */}
                        <td className="py-3.5 px-4 text-right font-mono">
                          {metrics.windowsArea > 0 ? (
                            <span className="text-zinc-400">
                              -{metrics.windowsArea.toFixed(2)}
                              <span className="text-[9px] text-zinc-500 block">({room.windows.reduce((acc, curr) => acc + curr.count, 0)} окн.)</span>
                            </span>
                          ) : (
                            <span className="text-zinc-500 font-mono">—</span>
                          )}
                        </td>

                        {/* Door deduction area requested as "площадь стены с дверным проемом" */}
                        <td className="py-3.5 px-4 text-right font-mono">
                          {metrics.doorsArea > 0 ? (
                            <span className="text-zinc-400">
                              -{metrics.doorsArea.toFixed(2)}
                              <span className="text-[9px] text-zinc-500 block">({room.doors.reduce((acc, curr) => acc + curr.count, 0)} дв.)</span>
                            </span>
                          ) : (
                            <span className="text-zinc-500 font-mono">—</span>
                          )}
                        </td>

                        {/* Net Walls area requested as "площадь ..." under decoration */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                          {metrics.netWallArea.toFixed(2)}
                        </td>

                        {/* Actions column */}
                        <td className="py-3.5 px-4 text-center print-hide" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              id={`btn-copy-room-${room.id}`}
                              onClick={() => handleCopyRow(room)}
                              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors"
                              title="Скопировать размеры текстом"
                            >
                              {copiedId === room.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {room.isCustom && (
                              <button
                                id={`btn-delete-row-${room.id}`}
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-1.5 hover:bg-red-500/10 rounded text-zinc-500 hover:text-red-400 transition-colors"
                                title="Удалить"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Quick instructions in the table foot */}
          <div className="border-t border-zinc-850 mt-4 pt-4 flex flex-wrap gap-4 justify-between items-center text-xs text-zinc-400 print-hide">
            <span className="flex items-center gap-1.5 font-mono text-[10px]">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              Все данные сохраняются локально. Поддерживается ручной ввод через панель справа.
            </span>
            <div className="flex gap-2">
              <button
                id="btn-copy-all-spec"
                onClick={handleCopyAllToClipboard}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 text-zinc-350 hover:text-zinc-100 transition-all cursor-pointer font-medium"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Скопировано!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Скопировать спецификацию
                  </>
                )}
              </button>
              <button
                id="btn-download-csv"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 text-emerald-400 hover:border-emerald-500/20 transition-all cursor-pointer font-semibold"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Скачать в Excel (.CSV)
              </button>
            </div>
          </div>
        </section>

        {/* COMPREHENSIVE MATERIALS PLANNER SECTION */}
        <section className="print-hide">
          <MaterialEstimatorPanel
            rooms={rooms}
            selectedRoom={selectedRoom}
            settings={settings}
            onUpdateSettings={setSettings}
          />
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950 mt-16 py-8 text-center text-xs text-zinc-500 print-hide">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-mono">Калькулятор площади стен и полов • Сделано для планирования ремонта</p>
          <div className="flex gap-3 justify-center mt-3 text-[10px] text-zinc-500 font-mono">
            <span>1 этаж: прихожая, коридор-холл, комната №1 под лестницей, туалет, котельная, подсобка</span>
            <span>•</span>
            <span>2 этаж: коридор №2, комнаты №2, 3, 4, 5</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
