const receiptsKey = "receipts_v_final_fixed";
const timersKey = "timers_v_final_fixed";
const historyKey = "history_v_final_fixed";
const paidAmountsKey = "paid_amounts_v_final_fixed";

const TABLE_KEYS = ["table1", "table2", "table3", "table4", "ps"];

const MENU_DATA = [
    {
        category: "На розлив",
        items: [
            { name: "Карлсберг 0.5", price: 40, unit: "шт" },
            { name: "Карлсберг 0.33", price: 25, unit: "шт" },
            { name: "Бланк 0.5", price: 50, unit: "шт" },
            { name: "Бланк 0.33", price: 35, unit: "шт" },
            { name: "Батяр 0.5", price: 30, unit: "шт" },
            { name: "Батяр 0.33", price: 20, unit: "шт" },
            { name: "Jack Daniel’s 50 г", price: 50, unit: "порц." },
            { name: "Jack Daniel’s 25 г", price: 50, unit: "порц." },
            { name: "Jameson 50 г", price: 40, unit: "порц." },
            { name: "Jameson 25 г", price: 40, unit: "порц." },
            { name: "Sheridan’s 50 г", price: 40, unit: "порц." },
            { name: "Sheridan’s 25 г", price: 40, unit: "порц." },
            { name: "Водка Finlandia 50 г", price: 40, unit: "порц." },
            { name: "Водка Finlandia 25 г", price: 40, unit: "порц." }
        ]
    },
    {
        category: "Пиво бутылки",
        items: [
            { name: "Grimbergen 0.33", price: 40, unit: "бут." },
            { name: "Львовское мягкое 0.5", price: 30, unit: "бут." },
            { name: "Роберт Домс 0.5", price: 30, unit: "бут." },
            { name: "Туборг 0.5", price: 35, unit: "бут." }
        ]
    },
    {
        category: "Мясо, закуски",
        items: [
            { name: "Шкура свиная", price: 60, unit: "уп." },
            { name: "Карпачо", price: 60, unit: "уп." },
            { name: "Ушки", price: 60, unit: "уп." },
            { name: "Орешки / гренки (доплата)", price: 10, unit: "порц." }
        ]
    },
    {
        category: "Вода",
        items: [
            { name: "Сок Campa", price: 30, unit: "шт" },
            { name: "MaxSpeed 0.25", price: 20, unit: "шт" },
            { name: "MaxSpeed 0.5", price: 30, unit: "шт" },
            { name: "Drive Energy", price: 20, unit: "шт" },
            { name: "CocaCola", price: 15, unit: "шт" },
            { name: "San Pellegrino", price: 25, unit: "шт" },
            { name: "Nordica", price: 15, unit: "шт" }
        ]
    }
];

const SERVICES_DATA = [
    {
        category: "Бильярд",
        services: [
            { name: "1 стол — Русский", pricePerHour: 100 },
            { name: "2 стол — Американский", pricePerHour: 100 }
        ]
    },
    {
        category: "PlayStation",
        services: [
            { name: "1 джойстик", pricePerHour: 30 },
            { name: "2 джойстика", pricePerHour: 30 }
        ]
    }
];

let receipts = createEmptyReceipts();
let paidAmounts = createEmptyPaidAmounts();
let receiptHistory = [];
let activeTimers = [];
let timerInterval = null;
let activeMenuCategory = MENU_DATA[0].category;
let currentTable = "table1";

const menuTabBtn = document.getElementById("menuTabBtn");
const servicesTabBtn = document.getElementById("servicesTabBtn");
const menuPanel = document.getElementById("menuPanel");
const servicesPanel = document.getElementById("servicesPanel");
const menuContent = document.getElementById("menuContent");
const menuCategories = document.getElementById("menuCategories");
const menuSearch = document.getElementById("menuSearch");
const servicesContent = document.getElementById("servicesContent");
const receiptItems = document.getElementById("receiptItems");
const totalPrice = document.getElementById("totalPrice");
const timersList = document.getElementById("timersList");
const timersCount = document.getElementById("timersCount");
const paidAmountInput = document.getElementById("paidAmountInput");
const paymentTotal = document.getElementById("paymentTotal");
const changeAmount = document.getElementById("changeAmount");
const paymentStatus = document.getElementById("paymentStatus");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const modalOkBtn = document.getElementById("modalOkBtn");
const historyModalOverlay = document.getElementById("historyModalOverlay");
const historyModalList = document.getElementById("historyModalList");
const currentTableBadge = document.getElementById("currentTableBadge");
const menuCountChip = document.getElementById("menuCountChip");
const servicesCountChip = document.getElementById("servicesCountChip");

menuTabBtn.addEventListener("click", () => switchTab("menu"));
servicesTabBtn.addEventListener("click", () => switchTab("services"));
menuSearch.addEventListener("input", renderMenu);
paidAmountInput.addEventListener("input", handlePaidAmountInput);

function createEmptyReceipts() {
    return {
        table1: [],
        table2: [],
        table3: [],
        table4: [],
        ps: []
    };
}

function createEmptyPaidAmounts() {
    return {
        table1: "",
        table2: "",
        table3: "",
        table4: "",
        ps: ""
    };
}

function showAlert(message, title = "Сообщение") {
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    modalCancelBtn.style.display = "none";
    modalOkBtn.textContent = "ОК";
    modalOverlay.classList.remove("hidden");

    const close = () => {
        modalOverlay.classList.add("hidden");
        modalOkBtn.removeEventListener("click", close);
    };

    modalOkBtn.addEventListener("click", close);
}

function showConfirm(message, onConfirm, title = "Подтверждение") {
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    modalCancelBtn.style.display = "inline-flex";
    modalOkBtn.textContent = "Подтвердить";
    modalOverlay.classList.remove("hidden");

    const close = () => {
        modalOverlay.classList.add("hidden");
        modalOkBtn.removeEventListener("click", confirmHandler);
        modalCancelBtn.removeEventListener("click", cancelHandler);
    };

    const confirmHandler = () => {
        close();
        if (typeof onConfirm === "function") onConfirm();
    };

    const cancelHandler = () => close();

    modalOkBtn.addEventListener("click", confirmHandler);
    modalCancelBtn.addEventListener("click", cancelHandler);
}

function switchTab(tab) {
    const isMenu = tab === "menu";

    menuTabBtn.classList.toggle("active", isMenu);
    servicesTabBtn.classList.toggle("active", !isMenu);
    menuPanel.classList.toggle("active", isMenu);
    servicesPanel.classList.toggle("active", !isMenu);
}

function switchTable(table, btn) {
    currentTable = table;

    document.querySelectorAll(".table-btn").forEach(x => x.classList.remove("active"));
    if (btn) btn.classList.add("active");

    currentTableBadge.textContent = getTableTitle(currentTable);
    paidAmountInput.value = paidAmounts[currentTable] || "";

    renderReceipt();
    renderPaymentInfo();
    renderTableStatuses();
}

function saveReceipts() {
    localStorage.setItem(receiptsKey, JSON.stringify(receipts));
}

function saveTimers() {
    localStorage.setItem(timersKey, JSON.stringify(activeTimers));
}

function saveHistory() {
    localStorage.setItem(historyKey, JSON.stringify(receiptHistory));
}

function savePaidAmounts() {
    localStorage.setItem(paidAmountsKey, JSON.stringify(paidAmounts));
}

function loadData() {
    try {
        const savedReceipts = JSON.parse(localStorage.getItem(receiptsKey) || "null");
        const savedTimers = JSON.parse(localStorage.getItem(timersKey) || "null");
        const savedHistory = JSON.parse(localStorage.getItem(historyKey) || "null");
        const savedPaidAmounts = JSON.parse(localStorage.getItem(paidAmountsKey) || "null");

        receipts = createEmptyReceipts();
        paidAmounts = createEmptyPaidAmounts();

        if (savedReceipts && typeof savedReceipts === "object") {
            TABLE_KEYS.forEach(key => {
                receipts[key] = Array.isArray(savedReceipts[key]) ? savedReceipts[key] : [];
            });
        }

        if (Array.isArray(savedTimers)) {
            activeTimers = savedTimers.map(timer => ({
                ...timer,
                tableKey: TABLE_KEYS.includes(timer.tableKey) ? timer.tableKey : "table1",
                paused: Boolean(timer.paused),
                pausedAt: timer.pausedAt || null,
                pausedMs: Number(timer.pausedMs || 0)
            }));
        }

        if (Array.isArray(savedHistory)) {
            receiptHistory = savedHistory;
        }

        if (savedPaidAmounts && typeof savedPaidAmounts === "object") {
            TABLE_KEYS.forEach(key => {
                paidAmounts[key] = savedPaidAmounts[key] || "";
            });
        }
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        receipts = createEmptyReceipts();
        paidAmounts = createEmptyPaidAmounts();
        receiptHistory = [];
        activeTimers = [];
    }

    paidAmountInput.value = paidAmounts[currentTable] || "";

    renderCategoryTabs();
    renderMenu();
    renderServices();
    renderReceipt();
    renderTimers();
    renderPaymentInfo();
    renderHistory();
    renderTableStatuses();
    startGlobalTimerLoop();
}

function renderCategoryTabs() {
    menuCategories.innerHTML = "";

    MENU_DATA.forEach(category => {
        const btn = document.createElement("button");
        btn.className = `category-tab ${activeMenuCategory === category.category ? "active" : ""}`;
        btn.textContent = category.category;
        btn.onclick = () => {
            activeMenuCategory = category.category;
            renderCategoryTabs();
            renderMenu();
        };
        menuCategories.appendChild(btn);
    });
}

function renderMenu() {
    const searchValue = menuSearch.value.trim().toLowerCase();
    menuContent.innerHTML = "";

    let categoriesToShow = MENU_DATA.filter(x => x.category === activeMenuCategory);

    if (searchValue) {
        categoriesToShow = MENU_DATA
            .map(category => ({
                category: category.category,
                items: category.items.filter(item =>
                    item.name.toLowerCase().includes(searchValue)
                )
            }))
            .filter(category => category.items.length > 0);
    }

    menuCountChip.textContent = `${categoriesToShow.reduce((sum, c) => sum + c.items.length, 0)} позиций`;

    if (!categoriesToShow.length) {
        menuContent.innerHTML = `<p class="empty-text">Ничего не найдено</p>`;
        return;
    }

    categoriesToShow.forEach((category, categoryIndex) => {
        const block = document.createElement("div");
        block.className = "category-block";

        if (searchValue) {
            const title = document.createElement("h3");
            title.className = "service-group-title";
            title.textContent = category.category;
            block.appendChild(title);
        }

        const cards = document.createElement("div");
        cards.className = "cards compact";

        category.items.forEach((item, itemIndex) => {
            const safeId = item.name.replaceAll(" ", "_").replaceAll(".", "_");
            const qtyId = `qty_${categoryIndex}_${itemIndex}_${safeId}`;

            const card = document.createElement("article");
            card.className = "item-card glass-inner";
            card.innerHTML = `
                <div class="item-meta">
                    <h3>${escapeHtml(item.name)}</h3>
                    <p>${item.price} лей</p>
                </div>

                <div class="item-actions">
                    <input type="number" min="1" value="1" class="qty-input" id="${qtyId}" />
                    <button class="add-btn" onclick="addMenuItem('${escapeJs(item.name)}', ${item.price}, '${qtyId}', '${escapeJs(item.unit)}')">+</button>
                </div>

                <div class="quick-add-row">
                    <button class="quick-add-btn" onclick="quickAddMenuItem('${escapeJs(item.name)}', ${item.price}, '${escapeJs(item.unit)}', 1)">+1</button>
                    <button class="quick-add-btn" onclick="quickAddMenuItem('${escapeJs(item.name)}', ${item.price}, '${escapeJs(item.unit)}', 2)">+2</button>
                    <button class="quick-add-btn" onclick="quickAddMenuItem('${escapeJs(item.name)}', ${item.price}, '${escapeJs(item.unit)}', 5)">+5</button>
                </div>

                <div class="price-tag">${item.price} лей</div>
            `;
            cards.appendChild(card);
        });

        block.appendChild(cards);

        if (category.category === "Мясо, закуски") {
            const note = document.createElement("div");
            note.className = "note-line";
            note.textContent = "За орешки и гренки +10 лей сверху.";
            block.appendChild(note);
        }

        menuContent.appendChild(block);
    });
}

function renderServices() {
    servicesContent.innerHTML = "";
    servicesCountChip.textContent = `${activeTimers.length} активных`;

    SERVICES_DATA.forEach((group, groupIndex) => {
        const block = document.createElement("div");
        block.className = "service-group";

        const title = document.createElement("h3");
        title.className = "service-group-title";
        title.textContent = group.category;
        block.appendChild(title);

        const cards = document.createElement("div");
        cards.className = "services-grid";

        group.services.forEach((service, serviceIndex) => {
            const freeLabelId = `free_service_label_${groupIndex}_${serviceIndex}`;
            const fixedLabelId = `fixed_service_label_${groupIndex}_${serviceIndex}`;
            const fixedHoursId = `fixed_service_hours_${groupIndex}_${serviceIndex}`;

            const card = document.createElement("article");
            card.className = "item-card glass-inner";
            card.innerHTML = `
                <div class="item-meta">
                    <h3>${escapeHtml(service.name)}</h3>
                    <p>${service.pricePerHour} лей / час</p>
                </div>

                <div class="timer-mode-block">
                    <div class="timer-mode-title">Свободное время</div>
                    <div class="service-form">
                        <input type="text" id="${freeLabelId}" placeholder="Имя клиента / комментарий" />
                        <button class="start-btn" onclick="startOpenService('${escapeJs(service.name)}', ${service.pricePerHour}, '${freeLabelId}')">
                            Старт свободного таймера
                        </button>
                    </div>
                </div>

                <div class="timer-mode-block">
                    <div class="timer-mode-title">Фиксированное время</div>
                    <div class="service-form">
                        <input type="text" id="${fixedLabelId}" placeholder="Имя клиента / комментарий" />
                        <input type="hidden" id="${fixedHoursId}" value="1" />

                        <div class="time-picker">
                            <button type="button" class="time-chip active" onclick="setFixedHours('${fixedHoursId}', this)">1ч</button>
                            <button type="button" class="time-chip" onclick="setFixedHours('${fixedHoursId}', this)">2ч</button>
                            <button type="button" class="time-chip" onclick="setFixedHours('${fixedHoursId}', this)">3ч</button>
                            <button type="button" class="time-chip" onclick="setFixedHours('${fixedHoursId}', this)">4ч</button>
                            <button type="button" class="time-chip" onclick="setFixedHours('${fixedHoursId}', this)">5ч</button>
                            <button type="button" class="time-chip" onclick="setFixedHours('${fixedHoursId}', this)">6ч</button>
                        </div>

                        <button class="start-btn" onclick="startFixedService('${escapeJs(service.name)}', ${service.pricePerHour}, '${fixedLabelId}', '${fixedHoursId}')">
                            Старт фиксированного таймера
                        </button>
                    </div>
                </div>
            `;
            cards.appendChild(card);
        });

        block.appendChild(cards);
        servicesContent.appendChild(block);
    });
}

function setFixedHours(inputId, button) {
    const value = button.textContent.replace("ч", "").trim();
    const hiddenInput = document.getElementById(inputId);

    if (hiddenInput) hiddenInput.value = value;

    const container = button.closest(".time-picker");
    if (!container) return;

    container.querySelectorAll(".time-chip").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
}

function addMenuItem(name, price, qtyInputId, unit) {
    const qtyValue = document.getElementById(qtyInputId)?.value;
    const quantity = Math.max(1, parseInt(qtyValue, 10) || 1);

    receipts[currentTable].push({
        id: crypto.randomUUID(),
        name,
        details: `${quantity} ${unit} x ${price} лей`,
        total: roundMoney(price * quantity)
    });

    saveReceipts();
    renderReceipt();
    renderTableStatuses();
}

function quickAddMenuItem(name, price, unit, quantity) {
    receipts[currentTable].push({
        id: crypto.randomUUID(),
        name,
        details: `${quantity} ${unit} x ${price} лей`,
        total: roundMoney(price * quantity)
    });

    saveReceipts();
    renderReceipt();
    renderTableStatuses();
}

function clearReceipt() {
    showConfirm(`Очистить чек для ${getTableTitle(currentTable)}?`, () => {
        receipts[currentTable] = [];
        paidAmounts[currentTable] = "";
        paidAmountInput.value = "";

        saveReceipts();
        savePaidAmounts();
        renderReceipt();
        renderPaymentInfo();
        renderTableStatuses();
    });
}

function closeCurrentReceipt() {
    const currentReceipt = receipts[currentTable];

    if (!currentReceipt.length) {
        showAlert("Чек пустой.", "Ошибка");
        return;
    }

    showConfirm(`Закрыть чек для ${getTableTitle(currentTable)}?`, () => {
        const total = getReceiptTotal(currentTable);
        const paid = Number(paidAmounts[currentTable] || 0);
        const change = Math.max(0, roundMoney(paid - total));
        const shortage = paid > 0 && paid < total ? roundMoney(total - paid) : 0;

        receiptHistory.unshift({
            id: crypto.randomUUID(),
            table: getTableTitle(currentTable),
            tableKey: currentTable,
            total,
            itemsCount: currentReceipt.length,
            createdAt: new Date().toLocaleString("ru-RU"),
            paid,
            change,
            shortage,
            paymentStatus: paid <= 0
                ? (total > 0 ? "Ожидание оплаты" : "Чек пуст")
                : paid >= total
                    ? "Оплачено"
                    : `Не хватает ${formatMoney(shortage)} лей`,
            items: currentReceipt.map(item => ({
                id: item.id,
                name: item.name,
                details: item.details,
                total: item.total
            }))
        });

        receipts[currentTable] = [];
        paidAmounts[currentTable] = "";
        paidAmountInput.value = "";

        saveReceipts();
        saveHistory();
        savePaidAmounts();
        renderReceipt();
        renderPaymentInfo();
        renderHistory();
        renderTableStatuses();
    });
}

function removeReceiptItem(id) {
    receipts[currentTable] = receipts[currentTable].filter(x => x.id !== id);
    saveReceipts();
    renderReceipt();
    renderPaymentInfo();
    renderTableStatuses();
}

function renderReceipt() {
    const currentReceipt = receipts[currentTable];

    if (!currentReceipt.length) {
        receiptItems.innerHTML = `<p class="empty-text">Пока ничего не добавлено</p>`;
        totalPrice.textContent = `0 лей`;
        renderPaymentInfo();
        return;
    }

    receiptItems.innerHTML = "";
    let total = 0;

    currentReceipt.forEach(item => {
        total += item.total;

        const el = document.createElement("div");
        el.className = "receipt-item";
        el.innerHTML = `
            <div>
                <h4>${escapeHtml(item.name)}</h4>
                <p>${escapeHtml(item.details)}</p>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
                <div class="receipt-price">${formatMoney(item.total)} лей</div>
                <button class="small-btn" onclick="removeReceiptItem('${item.id}')">Удалить</button>
            </div>
        `;
        receiptItems.appendChild(el);
    });

    totalPrice.textContent = `${formatMoney(total)} лей`;
    renderPaymentInfo();
}

function renderHistory() {
    if (!historyModalList) return;

    if (!receiptHistory.length) {
        historyModalList.innerHTML = `<p class="empty-text">История пока пустая</p>`;
        return;
    }

    historyModalList.innerHTML = "";

    receiptHistory.forEach(item => {
        const itemsHtml = (item.items || []).length
            ? item.items.map(receiptItem => `
                <div class="history-detail-item">
                    <div class="history-detail-item-top">
                        <div class="history-detail-item-name">${escapeHtml(receiptItem.name)}</div>
                        <div class="history-detail-item-sum">${formatMoney(receiptItem.total)} лей</div>
                    </div>
                    <div class="history-detail-item-sub">${escapeHtml(receiptItem.details || "Без деталей")}</div>
                </div>
            `).join("")
            : `<p class="empty-text">Позиции не найдены</p>`;

        const el = document.createElement("div");
        el.className = "history-item";
        el.innerHTML = `
            <div class="history-item-summary">
                <div class="history-item-top">
                    <div class="history-item-title">${escapeHtml(item.table)}</div>
                    <div class="history-item-time">${escapeHtml(item.createdAt)}</div>
                </div>
                <div class="history-item-sub">${item.itemsCount} поз. • ${formatMoney(item.total)} лей</div>
            </div>

            <div class="history-item-details hidden">
                <div class="history-detail-grid">
                    <div class="history-detail-row">
                        <span class="history-detail-label">Стол</span>
                        <span class="history-detail-value">${escapeHtml(item.table)}</span>
                    </div>
                    <div class="history-detail-row">
                        <span class="history-detail-label">Дата</span>
                        <span class="history-detail-value">${escapeHtml(item.createdAt)}</span>
                    </div>
                    <div class="history-detail-row">
                        <span class="history-detail-label">Позиций</span>
                        <span class="history-detail-value">${item.itemsCount}</span>
                    </div>
                    <div class="history-detail-row">
                        <span class="history-detail-label">Статус оплаты</span>
                        <span class="history-detail-value">${escapeHtml(item.paymentStatus || "—")}</span>
                    </div>
                    <div class="history-detail-row">
                        <span class="history-detail-label">Сумма чека</span>
                        <span class="history-detail-value">${formatMoney(item.total)} лей</span>
                    </div>
                    <div class="history-detail-row">
                        <span class="history-detail-label">Получено от клиента</span>
                        <span class="history-detail-value">${formatMoney(item.paid || 0)} лей</span>
                    </div>
                    <div class="history-detail-row">
                        <span class="history-detail-label">Сдача</span>
                        <span class="history-detail-value">${formatMoney(item.change || 0)} лей</span>
                    </div>
                    <div class="history-detail-row">
                        <span class="history-detail-label">Недостача</span>
                        <span class="history-detail-value">${formatMoney(item.shortage || 0)} лей</span>
                    </div>
                </div>

                <div class="history-detail-items-title">Состав чека</div>
                <div class="history-detail-items">
                    ${itemsHtml}
                </div>
            </div>
        `;

        const summary = el.querySelector(".history-item-summary");
        const details = el.querySelector(".history-item-details");

        summary.onclick = () => {
            const isHidden = details.classList.contains("hidden");
            details.classList.toggle("hidden", !isHidden);
            el.classList.toggle("expanded", isHidden);
        };

        historyModalList.appendChild(el);
    });
}

function openHistoryModal() {
    renderHistory();
    historyModalOverlay.classList.remove("hidden");
}

function closeHistoryModal() {
    historyModalOverlay.classList.add("hidden");
}

function clearHistory() {
    if (!receiptHistory.length) {
        showAlert("История чеков пуста.", "История");
        return;
    }

    closeHistoryModal();

    showConfirm("Очистить всю историю чеков?", () => {
        receiptHistory = [];
        saveHistory();
        renderHistory();
    }, "Подтверждение");
}

function startOpenService(serviceName, pricePerHour, labelInputId) {
    const labelValue = document.getElementById(labelInputId).value.trim() || "Без названия";

    activeTimers.push({
        id: crypto.randomUUID(),
        tableKey: currentTable,
        type: "open",
        serviceName,
        label: labelValue,
        pricePerHour,
        startTime: Date.now(),
        paused: false,
        pausedAt: null,
        pausedMs: 0
    });

    saveTimers();
    renderTimers();
    renderTableStatuses();
}

function startFixedService(serviceName, pricePerHour, labelInputId, hoursInputId) {
    const labelValue = document.getElementById(labelInputId).value.trim() || "Без названия";
    const hours = Math.max(1, parseInt(document.getElementById(hoursInputId).value, 10) || 1);
    const now = Date.now();

    activeTimers.push({
        id: crypto.randomUUID(),
        tableKey: currentTable,
        type: "fixed",
        serviceName,
        label: labelValue,
        pricePerHour,
        selectedHours: hours,
        startTime: now,
        endTime: now + hours * 60 * 60 * 1000,
        addedToReceipt: false,
        paused: false,
        pausedAt: null,
        pausedMs: 0
    });

    saveTimers();
    renderTimers();
    renderTableStatuses();
}

function pauseTimer(id) {
    const timer = activeTimers.find(x => x.id === id);
    if (!timer || timer.paused) return;

    timer.paused = true;
    timer.pausedAt = Date.now();
    saveTimers();
    renderTimers();
}

function resumeTimer(id) {
    const timer = activeTimers.find(x => x.id === id);
    if (!timer || !timer.paused) return;

    const pausedDuration = Date.now() - timer.pausedAt;
    timer.pausedMs += pausedDuration;

    if (timer.type === "fixed") {
        timer.endTime += pausedDuration;
    }

    timer.paused = false;
    timer.pausedAt = null;

    saveTimers();
    renderTimers();
}

function extendTimer(id, minutes) {
    const timer = activeTimers.find(x => x.id === id);
    if (!timer || timer.type !== "fixed") return;

    const extraMs = minutes * 60 * 1000;
    timer.endTime += extraMs;
    timer.selectedHours = roundToOneDecimal((timer.endTime - timer.startTime - (timer.pausedMs || 0)) / 3600000);

    saveTimers();
    renderTimers();
}

function startGlobalTimerLoop() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        autoFinishFixedTimers();
        renderTimers();
    }, 1000);
}

function autoFinishFixedTimers() {
    let changed = false;

    activeTimers.forEach(timer => {
        if (
            timer.type === "fixed" &&
            !timer.paused &&
            !timer.addedToReceipt &&
            Date.now() >= timer.endTime
        ) {
            const total = roundMoney(timer.selectedHours * timer.pricePerHour);

            receipts[timer.tableKey].push({
                id: crypto.randomUUID(),
                name: timer.serviceName,
                details: `${timer.label} • ${timer.selectedHours} ч • фиксированный таймер`,
                total
            });

            timer.addedToReceipt = true;
            changed = true;
        }
    });

    const oldLength = activeTimers.length;
    activeTimers = activeTimers.filter(timer => !(timer.type === "fixed" && timer.addedToReceipt));
    const removed = oldLength !== activeTimers.length;

    if (changed || removed) {
        saveReceipts();
        saveTimers();
        renderReceipt();
        renderTableStatuses();
    }
}

function renderTimers() {
    timersCount.textContent = activeTimers.length;
    servicesCountChip.textContent = `${activeTimers.length} активных`;

    if (!activeTimers.length) {
        timersList.innerHTML = `<p class="empty-text">Пока нет активных услуг</p>`;
        return;
    }

    timersList.innerHTML = "";

    activeTimers.forEach(timer => {
        const card = document.createElement("div");
        card.className = "timer-card";

        const tableText = getTableTitle(timer.tableKey);

        if (timer.type === "open") {
            const elapsedMs = getElapsedMs(timer);
            const elapsedText = formatTime(elapsedMs);
            const currentPrice = calculateOpenServicePrice(timer.pricePerHour, elapsedMs);

            card.classList.add("timer-status-ok");

            card.innerHTML = `
                <div class="timer-top">
                    <div>
                        <div class="timer-title">${escapeHtml(timer.serviceName)}</div>
                        <div class="timer-sub">${escapeHtml(timer.label)} • ${tableText} • Свободный таймер${timer.paused ? " • Пауза" : ""}</div>
                    </div>
                    <button class="small-btn" onclick="finishOpenService('${timer.id}')">Завершить</button>
                </div>
                <div class="timer-time">${elapsedText}</div>
                <div class="timer-money">Сейчас: ${formatMoney(currentPrice)} лей</div>
                <div class="timer-actions">
                    ${timer.paused
                        ? `<button class="small-btn" onclick="resumeTimer('${timer.id}')">Продолжить</button>`
                        : `<button class="small-btn" onclick="pauseTimer('${timer.id}')">Пауза</button>`}
                </div>
            `;
        } else {
            const remainingMs = Math.max(0, getRemainingMs(timer));
            const passedMs = getElapsedMs(timer);
            const totalFixedPrice = roundMoney(timer.selectedHours * timer.pricePerHour);

            if (remainingMs <= 60 * 1000) {
                card.classList.add("timer-status-danger");
            } else if (remainingMs <= 5 * 60 * 1000) {
                card.classList.add("timer-status-warn");
            } else {
                card.classList.add("timer-status-ok");
            }

            card.innerHTML = `
                <div class="timer-top">
                    <div>
                        <div class="timer-title">${escapeHtml(timer.serviceName)}</div>
                        <div class="timer-sub">${escapeHtml(timer.label)} • ${tableText} • ${timer.selectedHours} ч • Фиксированный таймер${timer.paused ? " • Пауза" : ""}</div>
                    </div>
                    <button class="small-btn" onclick="finishFixedServiceEarly('${timer.id}')">Завершить раньше</button>
                </div>
                <div class="timer-time">Осталось: ${formatTime(remainingMs)}</div>
                <div class="timer-sub" style="margin-top:8px;">Прошло: ${formatTime(passedMs)}</div>
                <div class="timer-money">К оплате: ${formatMoney(totalFixedPrice)} лей</div>
                <div class="timer-actions">
                    ${timer.paused
                        ? `<button class="small-btn" onclick="resumeTimer('${timer.id}')">Продолжить</button>`
                        : `<button class="small-btn" onclick="pauseTimer('${timer.id}')">Пауза</button>`}
                    <button class="small-btn" onclick="extendTimer('${timer.id}', 30)">+30 мин</button>
                    <button class="small-btn" onclick="extendTimer('${timer.id}', 60)">+1 час</button>
                </div>
            `;
        }

        timersList.appendChild(card);
    });
}

function finishOpenService(id) {
    const timer = activeTimers.find(x => x.id === id);
    if (!timer) return;

    const elapsedMs = getElapsedMs(timer);
    const total = calculateOpenServicePrice(timer.pricePerHour, elapsedMs);

    receipts[timer.tableKey].push({
        id: crypto.randomUUID(),
        name: timer.serviceName,
        details: `${timer.label} • ${formatElapsedForReceipt(elapsedMs)} • ${timer.pricePerHour} лей/час`,
        total
    });

    activeTimers = activeTimers.filter(x => x.id !== id);

    saveTimers();
    saveReceipts();
    renderTimers();
    renderReceipt();
    renderTableStatuses();
}

function finishFixedServiceEarly(id) {
    const timer = activeTimers.find(x => x.id === id);
    if (!timer) return;

    const total = roundMoney(timer.selectedHours * timer.pricePerHour);

    receipts[timer.tableKey].push({
        id: crypto.randomUUID(),
        name: timer.serviceName,
        details: `${timer.label} • ${timer.selectedHours} ч • завершено раньше`,
        total
    });

    activeTimers = activeTimers.filter(x => x.id !== id);

    saveTimers();
    saveReceipts();
    renderTimers();
    renderReceipt();
    renderTableStatuses();
}

function getElapsedMs(timer) {
    const now = timer.paused ? timer.pausedAt : Date.now();
    return Math.max(0, now - timer.startTime - (timer.pausedMs || 0));
}

function getRemainingMs(timer) {
    const now = timer.paused ? timer.pausedAt : Date.now();
    return timer.endTime - now;
}

function calculateOpenServicePrice(pricePerHour, elapsedMs) {
    const minutes = elapsedMs / 60000;
    const price = (pricePerHour / 60) * minutes;
    return roundMoney(price);
}

function getReceiptTotal(tableKey = currentTable) {
    return roundMoney(receipts[tableKey].reduce((sum, item) => sum + Number(item.total || 0), 0));
}

function handlePaidAmountInput() {
    paidAmounts[currentTable] = paidAmountInput.value || "";
    savePaidAmounts();
    renderPaymentInfo();
    renderTableStatuses();
}

function fillExactPaid() {
    const total = getReceiptTotal(currentTable);
    paidAmountInput.value = total;
    handlePaidAmountInput();
}

function renderPaymentInfo() {
    const total = getReceiptTotal(currentTable);
    const paid = Number(paidAmounts[currentTable] || 0);

    paymentTotal.textContent = `${formatMoney(total)} лей`;

    changeAmount.classList.remove("payment-ok", "payment-warn", "payment-neutral");
    paymentStatus.classList.remove("payment-ok", "payment-warn", "payment-neutral");

    if (!paid || paid <= 0) {
        changeAmount.textContent = `0 лей`;
        paymentStatus.textContent = total > 0 ? "Ожидание оплаты" : "Чек пуст";
        paymentStatus.classList.add("payment-neutral");
        changeAmount.classList.add("payment-neutral");
        return;
    }

    const diff = roundMoney(paid - total);

    if (diff >= 0) {
        changeAmount.textContent = `${formatMoney(diff)} лей`;
        paymentStatus.textContent = "Оплачено";
        paymentStatus.classList.add("payment-ok");
        changeAmount.classList.add("payment-ok");
    } else {
        changeAmount.textContent = `0 лей`;
        paymentStatus.textContent = `Не хватает ${formatMoney(Math.abs(diff))} лей`;
        paymentStatus.classList.add("payment-warn");
        changeAmount.classList.add("payment-neutral");
    }
}

function renderTableStatuses() {
    const tableButtons = document.querySelectorAll(".table-btn");

    tableButtons.forEach(btn => {
        const text = btn.textContent.trim();
        const key = getTableKeyByLabel(text);

        btn.classList.remove(
            "table-status-empty",
            "table-status-receipt",
            "table-status-timer",
            "table-status-paid"
        );

        const hasReceipt = (receipts[key] || []).length > 0;
        const hasTimer = activeTimers.some(timer => timer.tableKey === key);
        const total = getReceiptTotal(key);
        const paid = Number(paidAmounts[key] || 0);
        const isPaid = total > 0 && paid >= total;

        if (hasTimer) {
            btn.classList.add("table-status-timer");
        } else if (isPaid) {
            btn.classList.add("table-status-paid");
        } else if (hasReceipt) {
            btn.classList.add("table-status-receipt");
        } else {
            btn.classList.add("table-status-empty");
        }
    });
}

function getTableKeyByLabel(label) {
    if (label === "Стол 1") return "table1";
    if (label === "Стол 2") return "table2";
    if (label === "Стол 3") return "table3";
    if (label === "Стол 4") return "table4";
    return "ps";
}

function getTableTitle(tableKey) {
    if (tableKey === "table1") return "Стол 1";
    if (tableKey === "table2") return "Стол 2";
    if (tableKey === "table3") return "Стол 3";
    if (tableKey === "table4") return "Стол 4";
    return "PS";
}

function changePaid(amount) {
    let value = Number(paidAmountInput.value) || 0;
    value += amount;
    if (value < 0) value = 0;

    paidAmountInput.value = value;
    handlePaidAmountInput();
}

function formatElapsedForReceipt(ms) {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours <= 0) return `${minutes} мин`;
    return `${hours} ч ${minutes} мин`;
}

function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatMoney(value) {
    return `${Math.round(Number(value) || 0)}`;
}

function formatLiveMoney(value) {
    return Number(value || 0).toFixed(2);
}

function roundMoney(value) {
    return Math.round(Number(value) || 0);
}

function roundMoneyExact(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
}

function roundToOneDecimal(value) {
    return Math.round((Number(value) || 0) * 10) / 10;
}

function pad(value) {
    return String(value).padStart(2, "0");
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeJs(text) {
    return String(text)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");
}

loadData();