document.addEventListener("DOMContentLoaded", () => {
  const studentBtn = document.getElementById("student-btn");
  const delivererBtn = document.getElementById("deliverer-btn");
  const studentForm = document.getElementById("student-form");
  const delivererPanel = document.getElementById("deliverer-panel");
  const orderForm = document.getElementById("order-form");
  const orderList = document.getElementById("order-list");
  const totalPrice = document.getElementById("total-price");

  const prices = {
    burger: 100,
    pizza: 150,
    salad: 80,
  };

  // Показать форму студента
  studentBtn.addEventListener("click", () => {
    studentForm.classList.remove("hidden");
    delivererPanel.classList.add("hidden");
  });

  // Показать панель доставщика
  delivererBtn.addEventListener("click", async () => {
    studentForm.classList.add("hidden");
    delivererPanel.classList.remove("hidden");

    // Получить данные о заказах с сервера
    const orders = await fetch("/orders").then((res) => res.json());
    renderOrders(orders);
  });

  // Отправка формы студента
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(orderForm);
    const order = {
      name: formData.get("name"),
      items: [
        formData.get("item1"),
        formData.get("item2"),
        formData.get("item3"),
      ].filter((item) => item !== ""), // Убираем пустые значения
    };

    // Проверяем, что хотя бы одно блюдо выбрано
    if (order.items.length === 0) {
      alert("Выберите хотя бы одно блюдо!");
      return;
    }

    // Отправить заказ на сервер
    await fetch("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    alert("Замовлення відправлено!");
    orderForm.reset();
    updateTotalPrice();
  });

  // Обновление итоговой суммы
  function updateTotalPrice() {
    const item1 = document.getElementById("item1").value;
    const item2 = document.getElementById("item2").value;
    const item3 = document.getElementById("item3").value;

    const total =
      (prices[item1] || 0) + (prices[item2] || 0) + (prices[item3] || 0);

    totalPrice.textContent = total;
  }

  document.querySelectorAll("select").forEach((select) => {
    select.addEventListener("change", updateTotalPrice);
  });

  // Отрисовка заказов для доставщика
  function renderOrders(orders) {
    const summary = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (summary[item]) {
          summary[item]++;
        } else {
          summary[item] = 1;
        }
      });
    });

    orderList.innerHTML = "";
    for (const [item, count] of Object.entries(summary)) {
      const li = document.createElement("li");
      li.textContent = `${item}: ${count} шт.`;
      orderList.appendChild(li);
    }
  }
  // Кнопка очистки базы данных
  const clearDbBtn = document.getElementById("clear-db-btn");

  clearDbBtn.addEventListener("click", async () => {
    // Запрашиваем пароль
    const password = prompt("Введите пароль для очистки базы данных:");

    // Проверяем пароль
    if (password === "123") {
      // Отправляем запрос на сервер для очистки базы данных
      await fetch("/clear-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      alert("База данных успешно очищена!");
      renderOrders([]); // Очищаем список заказов на странице
    } else {
      alert("Неверный пароль!");
    }
  });
});
