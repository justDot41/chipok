document.addEventListener("DOMContentLoaded", () => {
  const studentBtn = document.getElementById("student-btn");
  const delivererBtn = document.getElementById("deliverer-btn");
  const studentForm = document.getElementById("student-form");
  const delivererPanel = document.getElementById("deliverer-panel");
  const orderForm = document.getElementById("order-form");
  const orderList = document.getElementById("order-list");
  const totalPrice = document.getElementById("total-price");

  const prices = {
    burger: 63,
    pizza: 63,
    panini: 63,
    sokovinka: 40,
    nonstop: 40,
    zapekanka: 56,
    slayka: 36,
    cola: 40,
  };

  // Показати форму студента
  studentBtn.addEventListener("click", () => {
    studentForm.classList.remove("hidden");
    delivererPanel.classList.add("hidden");
  });

  // Показати панель доставщика
  delivererBtn.addEventListener("click", async () => {
    studentForm.classList.add("hidden");
    delivererPanel.classList.remove("hidden");

    // Отримати дані про замовлення з сервера
    const orders = await fetch("/orders").then((res) => res.json());
    renderOrders(orders);
  });

  // Відправка форми студента
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(orderForm);
    const order = {
      name: formData.get("name"),
      items: [
        formData.get("item1"),
        formData.get("item2"),
        formData.get("item3"),
      ].filter((item) => item !== ""), // Видаляємо порожні значення
    };

    // Перевіряємо, що хоча б одна страва вибрана
    if (order.items.length === 0) {
      alert("Виберіть хоча б одну страву!");
      return;
    }

    // Відправити замовлення на сервер
    await fetch("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    alert("Замовлення відправлено!");
    orderForm.reset();
    updateTotalPrice();
  });

  // Оновлення підсумкової суми
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

  // Відображення замовлень для доставщика
  function renderOrders(orders) {
    const summary = {};
    let totalRevenue = 0;

    orderList.innerHTML = "";
    orders.forEach((order) => {
      const li = document.createElement("li");
      li.innerHTML = `
      <strong>${order.name}</strong>: 
      ${order.items.join(", ")} — <em>${order.total} грн.</em>
    `;
      orderList.appendChild(li);

      // Рахуємо загальну кількість кожного продукту
      order.items.forEach((item) => {
        if (summary[item]) {
          summary[item]++;
        } else {
          summary[item] = 1;
        }
      });

      // Рахуємо загальний дохід
      totalRevenue += order.total;
    });

    // Додаємо загальний список продуктів
    const summaryLi = document.createElement("li");
    summaryLi.innerHTML = "<strong>Загальний список:</strong>";
    orderList.appendChild(summaryLi);

    for (const [item, count] of Object.entries(summary)) {
      const itemLi = document.createElement("li");
      itemLi.textContent = `${item}: ${count} шт.`;
      orderList.appendChild(itemLi);
    }

    // Додаємо загальний дохід
    const revenueLi = document.createElement("li");
    revenueLi.innerHTML = `<strong>Загальна вартість:</strong> ${totalRevenue} грн.`;
    orderList.appendChild(revenueLi);
  }

  // Кнопка очищення бази даних
  const clearDbBtn = document.getElementById("clear-db-btn");

  clearDbBtn.addEventListener("click", async () => {
    // Запитуємо пароль
    const password = prompt("Введіть пароль для очищення бази даних:");

    // Перевіряємо пароль
    if (password === "123") {
      // Відправляємо запит на сервер для очищення бази даних
      await fetch("/clear-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      alert("База даних успішно очищена!");
      renderOrders([]); // Очищаємо список замовлень на сторінці
    } else {
      alert("Невірний пароль!");
    }
  });
});
