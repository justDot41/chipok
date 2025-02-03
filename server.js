const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "db.json");

// Проміжне ПЗ для обробки JSON
app.use(express.json());

// Читання бази даних
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

// Запис у базу даних
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Ініціалізація бази даних
if (!fs.existsSync(DB_PATH)) {
  writeDB([]);
}

// Маршрут для отримання замовлень
app.get("/orders", (req, res) => {
  const orders = readDB();
  res.json(orders);
});

// Маршрут для додавання замовлення
app.post("/orders", (req, res) => {
  const { name, items } = req.body;

  // Фільтруємо порожні значення
  const filteredItems = items.filter((item) => item);

  // Перевіряємо, що є хоча б одна страва
  if (filteredItems.length === 0) {
    return res.status(400).send("Замовлення повинно містити хоча б одну страву.");
  }

  // Розраховуємо загальну суму замовлення
  const prices = {
    burger: 63,
    pizza: 66,
    panini: 63,
    sokovinka: 35,
    nonstop: 62,
    zapekanka: 60,
    sloyka: 38,
    cola: 40,
    pitbull: 47,
    sok: 40,
  };

  const total = filteredItems.reduce(
    (sum, item) => sum + (prices[item] || 0),
    0
  );

  // Создаем объект заказа
  const order = {
    name,
    items: filteredItems,
    total,
  };

  const orders = readDB();
  orders.push(order);
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
