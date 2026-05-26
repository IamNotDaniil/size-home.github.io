import { Room, MaterialEstimationSettings } from "./types";

export const initialRooms: Room[] = [
  // --- 1 ЭТАЖ ---
  {
    id: "vestibule-1",
    name: "Прихожая",
    floor: 1,
    width: 2.5,
    length: 3.0,
    height: 2.8,
    windows: [],
    doors: [
      { id: "v-d1", width: 0.9, height: 2.1, count: 1 }, // Входная дверь
      { id: "v-d2", width: 0.8, height: 2.0, count: 1 }, // Межкомнатная дверь
    ],
  },
  {
    id: "corridor-1",
    name: "Коридор-холл",
    floor: 1,
    width: 2.0,
    length: 5.5,
    height: 2.8,
    windows: [
      { id: "c-w1", width: 0.6, height: 1.2, count: 1 }, // Небольшое окно у лестницы
    ],
    doors: [
      { id: "c-d1", width: 0.8, height: 2.0, count: 4 }, // Двери в туалет, котельную, подсобку, комнату 1
    ],
  },
  {
    id: "room-under-stair",
    name: "Комната №1 под лестницей",
    floor: 1,
    width: 2.2,
    length: 3.2,
    height: 2.2, // Средняя высота из-за скоса лестницы
    windows: [
      { id: "s-w1", width: 0.8, height: 0.8, count: 1 },
    ],
    doors: [
      { id: "s-d1", width: 0.8, height: 2.0, count: 1 },
    ],
  },
  {
    id: "toilet-1",
    name: "Туалет",
    floor: 1,
    width: 1.6,
    length: 1.8,
    height: 2.8,
    windows: [
      { id: "t-w1", width: 0.5, height: 0.5, count: 1 }, // Форточка
    ],
    doors: [
      { id: "t-d1", width: 0.7, height: 2.0, count: 1 },
    ],
  },
  {
    id: "boiler-1",
    name: "Котельная",
    floor: 1,
    width: 2.0,
    length: 3.0,
    height: 2.8,
    windows: [
      { id: "b-w1", width: 0.8, height: 1.0, count: 1 }, // Окно по нормам газа
    ],
    doors: [
      { id: "b-d1", width: 0.8, height: 2.0, count: 1 },
    ],
  },
  {
    id: "utility-1",
    name: "Подсобка",
    floor: 1,
    width: 1.8,
    length: 2.0,
    height: 2.8,
    windows: [],
    doors: [
      { id: "u-d1", width: 0.7, height: 2.0, count: 1 },
    ],
  },

  // --- 2 ЭТАЖ ---
  {
    id: "corridor-2",
    name: "Коридор №2",
    floor: 2,
    width: 1.8,
    length: 4.5,
    height: 2.7,
    windows: [
      { id: "c2-w1", width: 1.0, height: 1.4, count: 1 }, // Окно в коридоре
    ],
    doors: [
      { id: "c2-d1", width: 0.8, height: 2.0, count: 4 }, // Входные двери в комнаты 2,3,4,5
    ],
  },
  {
    id: "room-2",
    name: "Комната №2",
    floor: 2,
    width: 3.2,
    length: 4.0,
    height: 2.7,
    windows: [
      { id: "r2-w1", width: 1.4, height: 1.4, count: 1 },
    ],
    doors: [
      { id: "r2-d1", width: 0.8, height: 2.0, count: 1 },
    ],
  },
  {
    id: "room-3",
    name: "Комната №3",
    floor: 2,
    width: 3.0,
    length: 3.5,
    height: 2.7,
    windows: [
      { id: "r3-w1", width: 1.4, height: 1.4, count: 1 },
    ],
    doors: [
      { id: "r3-d1", width: 0.8, height: 2.0, count: 1 },
    ],
  },
  {
    id: "room-4",
    name: "Комната №4",
    floor: 2,
    width: 4.0,
    length: 4.5,
    height: 2.7,
    windows: [
      { id: "r4-w1", width: 1.4, height: 1.4, count: 2 }, // Два окна
    ],
    doors: [
      { id: "r4-d1", width: 0.8, height: 2.0, count: 1 },
    ],
  },
  {
    id: "room-5",
    name: "Комната №5",
    floor: 2,
    width: 2.8,
    length: 3.2,
    height: 2.7,
    windows: [
      { id: "r5-w1", width: 1.2, height: 1.4, count: 1 },
    ],
    doors: [
      { id: "r5-d1", width: 0.8, height: 2.0, count: 1 },
    ],
  },
];

export const defaultEstimationSettings: MaterialEstimationSettings = {
  wallpaper: {
    rollWidth: 1.06, // Широкие обои («метровые»)
    rollLength: 10.0,
    patternRepeat: 0.0, // Без подбора рисунка по умолчанию
    wasteCoefficient: 1.10, // 10% запас
  },
  paint: {
    consumption: 180, // 180 г / кв.м на 1 слой
    coats: 2,
    density: 1.35, // 1.35 кг / л (матовая акриловая краска)
  },
  flooring: {
    packageArea: 2.15, // кв.м ламината в упаковке
    wasteCoefficient: 1.05, // 5% запас прямая укладка
  },
  plinth: {
    unitLength: 2.5, // Длина плинтуса 2.5 м
    wasteCoefficient: 1.08, // 8% запас на подрезку углов
  },
  drywall: {
    sheetArea: 3.0, // Лист 1.2 x 2.5 м
  }
};
