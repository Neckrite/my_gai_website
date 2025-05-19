// Получаем текущего пользователя
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
let bookings = JSON.parse(localStorage.getItem('techInspections')) || [];

// Элементы интерфейса
const userView = document.getElementById('userView');
const adminView = document.getElementById('adminView');
const userCarNumber = document.getElementById('userCarNumber');
const userBookingsContainer = document.getElementById('userBookings');
const scheduleContainer = document.getElementById('scheduleContainer');
const inspectionDate = document.getElementById('inspectionDate');
const inspectionTime = document.getElementById('inspectionTime');
const addScheduleBtn = document.getElementById('addScheduleBtn');
const adminSchedule = document.getElementById('adminSchedule');
const alertDiv = document.getElementById('alert');
const logo = document.getElementById('logo');

// Установка минимальной и максимальной даты
const today = new Date();
const nextYear = new Date();
nextYear.setFullYear(today.getFullYear() + 1);

// Форматирование даты для input[type="date"]
function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

inspectionDate.min = formatDateForInput(today);
inspectionDate.max = formatDateForInput(nextYear);

// Проверка роли пользователя
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// Генерация ID пользователя
function getUserId(user) {
    return `${user.name}_${user.surname}`;
}

// Инициализация интерфейса
function initInterface() {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    if (isAdmin()) {
        userView.style.display = 'none';
        adminView.style.display = 'block';
        loadAdminSchedule();
    } else {
        userView.style.display = 'block';
        adminView.style.display = 'none';
        loadUserBookings();
        loadAvailableSlots();
    }
}

// Загрузка записей пользователя
function loadUserBookings() {
    userBookingsContainer.innerHTML = '';
    
    const userBookings = bookings.filter(booking => 
        booking.userId === getUserId(currentUser)
    );
    
    if (userBookings.length === 0) {
        userBookingsContainer.innerHTML = '<p>У вас нет активных записей на техосмотр</p>';
        return;
    }
    
    userBookings.forEach(booking => {
        const bookingElement = document.createElement('div');
        bookingElement.className = 'booking-item';
        bookingElement.innerHTML = `
            <p><strong>📅 Дата:</strong> ${formatDate(booking.date)}</p>
            <p><strong>⏰ Время:</strong> ${booking.time}</p>
            <p><strong>🚗 Гос. номер:</strong> ${booking.carNumber || 'не указан'}</p>
            <button onclick="cancelBooking('${booking.id}')">❌ Отменить запись</button>
        `;
        userBookingsContainer.appendChild(bookingElement);
    });
}

// Загрузка доступных слотов
function loadAvailableSlots() {
    scheduleContainer.innerHTML = '';
    
    const availableSlots = bookings.filter(slot => !slot.userId);
    
    if (availableSlots.length === 0) {
        scheduleContainer.innerHTML = '<p>На данный момент нет доступных дат для записи</p>';
        return;
    }
    
    // Группировка по дате
    const slotsByDate = {};
    availableSlots.forEach(slot => {
        if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
        slotsByDate[slot.date].push(slot);
    });
    
    // Сортировка дат от ближайшей к дальней
    const sortedDates = Object.keys(slotsByDate).sort();
    
    // Отображение слотов
    sortedDates.forEach(date => {
        const dateElement = document.createElement('div');
        dateElement.innerHTML = `<h3>${formatDate(date)}</h3>`;
        
        const timeSlots = document.createElement('div');
        timeSlots.className = 'time-slots';
        
        // Сортировка времени
        slotsByDate[date].sort((a, b) => a.time.localeCompare(b.time)).forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot';
            slotElement.innerHTML = `
                <div>🕒 ${slot.time}</div>
                <small>Нажмите для записи</small>
            `;
            slotElement.onclick = () => bookSlot(slot.id);
            timeSlots.appendChild(slotElement);
        });
        
        dateElement.appendChild(timeSlots);
        scheduleContainer.appendChild(dateElement);
    });
}

// Запись на слот
function bookSlot(slotId) {
    const carNumber = userCarNumber.value.trim();
    const carNumberRegex = /^[0-9]{4}[A-Za-z]{2}-[0-9]$/;
    
    if (!carNumber || !carNumberRegex.test(carNumber)) {
        showAlert('Введите корректный гос. номер (формат: 1234AB-7)', 'error');
        return;
    }
    
    // Проверка существующей записи
    const hasBooking = bookings.some(b => b.userId === getUserId(currentUser));
    if (hasBooking) {
        showAlert('У вас уже есть активная запись на техосмотр', 'error');
        return;
    }
    
    const slotIndex = bookings.findIndex(s => s.id === slotId);
    if (slotIndex === -1 || bookings[slotIndex].userId) {
        showAlert('Это время уже занято', 'error');
        loadAvailableSlots();
        return;
    }
    
    // Обновление записи
    bookings[slotIndex].userId = getUserId(currentUser);
    bookings[slotIndex].carNumber = carNumber;
    saveBookings();
    
    showAlert('✅ Вы успешно записаны на техосмотр!', 'success');
    loadUserBookings();
    loadAvailableSlots();
}

// Отмена записи
function cancelBooking(slotId) {
    if (!confirm('Вы уверены, что хотите отменить запись?')) return;
    
    const slotIndex = bookings.findIndex(s => s.id === slotId);
    if (slotIndex !== -1 && bookings[slotIndex].userId === getUserId(currentUser)) {
        bookings[slotIndex].userId = null;
        bookings[slotIndex].carNumber = null;
        saveBookings();
        
        showAlert('Запись успешно отменена', 'success');
        loadUserBookings();
        loadAvailableSlots();
    }
}

// Админ: загрузка расписания
function loadAdminSchedule() {
    adminSchedule.innerHTML = '';
    
    const slotsByDate = {};
    bookings.forEach(slot => {
        if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
        slotsByDate[slot.date].push(slot);
    });
    
    // Сортировка дат
    const sortedDates = Object.keys(slotsByDate).sort();
    
    sortedDates.forEach(date => {
        const dateElement = document.createElement('div');
        dateElement.innerHTML = `<h3>${formatDate(date)}</h3>`;
        
        const timeSlots = document.createElement('div');
        timeSlots.className = 'time-slots';
        
        // Сортировка времени
        slotsByDate[date].sort((a, b) => a.time.localeCompare(b.time)).forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = `time-slot ${slot.userId ? 'booked' : ''}`;
            
            if (slot.userId) {
                const user = findUser(slot.userId);
                slotElement.innerHTML = `
                    <div>🕒 ${slot.time}</div>
                    <div>🚗 ${slot.carNumber || 'нет номера'}</div>
                    <div>👤 ${user ? `${user.name} ${user.surname}` : 'Неизвестный'}</div>
                    <button class="admin-btn" onclick="adminCancelBooking('${slot.id}')">Отменить</button>
                `;
            } else {
                slotElement.innerHTML = `
                    <div>🕒 ${slot.time}</div>
                    <div>Свободно</div>
                    <button class="admin-btn" onclick="deleteSlot('${slot.id}')">Удалить</button>
                `;
            }
            
            timeSlots.appendChild(slotElement);
        });
        
        dateElement.appendChild(timeSlots);
        adminSchedule.appendChild(dateElement);
    });
}

// Админ: отмена записи
function adminCancelBooking(slotId) {
    if (!confirm('Отменить запись пользователя?')) return;
    
    const slotIndex = bookings.findIndex(s => s.id === slotId);
    if (slotIndex !== -1) {
        bookings[slotIndex].userId = null;
        bookings[slotIndex].carNumber = null;
        saveBookings();
        showAlert('Запись пользователя отменена', 'success');
        loadAdminSchedule();
    }
}

// Админ: удаление слота
function deleteSlot(slotId) {
    if (!confirm('Удалить этот слот из расписания?')) return;
    
    bookings = bookings.filter(s => s.id !== slotId);
    saveBookings();
    showAlert('Слот удален из расписания', 'success');
    loadAdminSchedule();
}

// Админ: добавление слота
addScheduleBtn.addEventListener('click', () => {
    const date = inspectionDate.value;
    const time = inspectionTime.value;
    
    if (!date || !time) {
        showAlert('Заполните все поля', 'error');
        return;
    }
    
    // Проверка на дублирование
    const exists = bookings.some(s => s.date === date && s.time === time);
    if (exists) {
        showAlert('Это время уже есть в расписании', 'error');
        return;
    }
    
    // Добавление нового слота
    bookings.push({
        id: generateId(),
        date,
        time,
        userId: null,
        carNumber: null
    });
    
    saveBookings();
    showAlert('Новый слот добавлен в расписание', 'success');
    loadAdminSchedule();
    
    // Сброс полей
    inspectionDate.value = '';
    inspectionTime.value = '';
});

// Вспомогательные функции
function formatDate(dateString) {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function showAlert(message, type) {
    alertDiv.textContent = message;
    alertDiv.className = `alert ${type}`;
    setTimeout(() => {
        alertDiv.textContent = '';
        alertDiv.className = 'alert';
    }, 5000);
}

function saveBookings() {
    localStorage.setItem('techInspections', JSON.stringify(bookings));
}

function findUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(u => getUserId(u) === userId);
}

// Переход на главную
logo.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Инициализация
initInterface();