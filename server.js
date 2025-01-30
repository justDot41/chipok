const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "db.json");

// Промежуточное ПО для обработки JSON
app.use(express.json());

// Чтение базы данных
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

// Запись в базу данных
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Инициализация базы данных
if (!fs.existsSync(DB_PATH)) {
  writeDB([]);
}

// Маршрут для получения заказов
app.get("/orders", (req, res) => {
  const orders = readDB();
  res.json(orders);
});

// Маршрут для добавления заказа
app.post("/orders", (req, res) => {
  const { name, items } = req.body;

  // Фильтруем пустые значения
  const filteredItems = items.filter((item) => item);

  // Проверяем, что есть хотя бы одно блюдо
  if (filteredItems.length === 0) {
    return res.status(400).send("Заказ должен содержать хотя бы одно блюдо.");
  }

  const orders = readDB();
  orders.push({ name, items: filteredItems });
  writeDB(orders);

  res.status(201).send("Заказ добавлен");
});

// Маршрут для очистки базы данных
app.post("/clear-orders", (req, res) => {
  writeDB([]); // Очищаем базу данных
  res.status(200).send("База данных очищена");
});

// Статические файлы
app.use(express.static(path.join(__dirname)));

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
