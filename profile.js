// Получение элементов страницы
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const profileName = document.getElementById('profileName');
const avatar = document.getElementById('avatar');
const avatarInput = document.getElementById('avatarInput');
const profileForm = document.getElementById('profileForm');
const logoutButton = document.getElementById('logout');
const logo = document.getElementById('logo');
const pageContainer = document.querySelector('.page-container');

// Загрузка данных пользователя
function loadUserData() {
    if (currentUser) {
        profileName.textContent = `${currentUser.name} ${currentUser.surname}`;
        if (currentUser.avatar) avatar.src = currentUser.avatar;
        document.getElementById('info').value = currentUser.info || '';
        document.getElementById('dob').value = currentUser.dob || '';
        document.getElementById('country').value = currentUser.country || '';

        // Проверка на администратора
        if (currentUser.role === 'admin') {
            showAdminPanel();
        }
    } else {
        window.location.href = 'index.html';
    }
}

// Сохранение изменений профиля
profileForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const info = document.getElementById('info').value;
    const dob = document.getElementById('dob').value;
    const country = document.getElementById('country').value;

    // Валидация данных
    if (info.length > 100) {
        alert('Дополнительная информация не может превышать 100 символов!');
        document.getElementById('info').value = currentUser.info || '';
        return;
    }

    const today = new Date();
    const minDate = new Date('1901-01-01');
    const selectedDate = new Date(dob);

    if (selectedDate < minDate || selectedDate > today) {
        alert('Некорректная дата рождения!');
        document.getElementById('dob').value = currentUser.dob || '';
        return;
    }

    // Сохранение данных
    currentUser.info = info;
    currentUser.dob = dob;
    currentUser.country = country;
    saveCurrentUserChanges();
    
    // Анимация успешного сохранения
    const saveBtn = profileForm.querySelector('button[type="submit"]');
    saveBtn.textContent = '✓ Сохранено';
    saveBtn.style.background = '#00cc66';
    setTimeout(() => {
        saveBtn.textContent = 'Сохранить';
        saveBtn.style.background = '';
    }, 2000);
});

// Функция сохранения изменений
function saveCurrentUserChanges() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(
        user => user.name === currentUser.name && user.surname === currentUser.surname
    );

    if (userIndex !== -1) {
        users[userIndex] = currentUser;
    } else {
        users.push(currentUser);
    }

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Изменение аватарки
avatarInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        // Проверка типа файла
        if (!file.type.match('image.*')) {
            alert('Пожалуйста, выберите изображение!');
            return;
        }

        // Проверка размера файла (не более 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Изображение должно быть меньше 2MB!');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            avatar.src = e.target.result;
            currentUser.avatar = e.target.result;
            saveCurrentUserChanges();
            
            // Анимация смены аватарки
            avatar.style.transform = 'scale(1.1)';
            setTimeout(() => {
                avatar.style.transform = '';
            }, 300);
        };
        reader.readAsDataURL(file);
    }
});

// Выход из профиля
logoutButton.addEventListener('click', () => {
    // Анимация выхода
    logoutButton.textContent = 'Выход...';
    logoutButton.style.background = '#ff3366';
    
    setTimeout(() => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }, 1000);
});

// Переход на главную страницу
logo.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Функция отображения панели администратора
function showAdminPanel() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const adminContainer = document.createElement('div');
    adminContainer.className = 'admin-container';
    adminContainer.innerHTML = '<h2>Панель администратора</h2>';

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    users.forEach((user, index) => {
        if (user.role !== 'admin') {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.surname}</td>
                <td>
                    <button class="admin-btn" onclick="addFine(${index})">Добавить штраф</button>
                    <button class="admin-btn" onclick="removeFine(${index})">Удалить штраф</button>
                </td>
            `;
            tbody.appendChild(row);
        }
    });

    adminContainer.appendChild(table);

    // Кнопка для отображения штрафов
    const toggleFinesButton = document.createElement('button');
    toggleFinesButton.className = 'toggle-fines-btn';
    toggleFinesButton.textContent = 'Показать штрафы';
    toggleFinesButton.addEventListener('click', toggleFinesList);

    // Блок списка штрафов
    const finesList = document.createElement('div');
    finesList.className = 'fines-list hidden';
    updateFinesList(finesList);

    adminContainer.appendChild(toggleFinesButton);
    adminContainer.appendChild(finesList);
    pageContainer.appendChild(adminContainer);
}

// Функция переключения видимости списка штрафов
function toggleFinesList() {
    const finesList = document.querySelector('.fines-list');
    const toggleBtn = document.querySelector('.toggle-fines-btn');
    
    finesList.classList.toggle('hidden');
    toggleBtn.textContent = finesList.classList.contains('hidden') 
        ? 'Показать штрафы' 
        : 'Скрыть штрафы';
}

// Функция обновления списка штрафов
function updateFinesList(finesList) {
    finesList.innerHTML = '<h2>Неоплаченные штрафы</h2>';
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    users.forEach(user => {
        if (user.fines && user.fines.length > 0) {
            const unpaidFines = user.fines.filter(fine => !fine.paid);
            if (unpaidFines.length > 0) {
                const userHeader = document.createElement('p');
                userHeader.innerHTML = `<strong>${user.name} ${user.surname}</strong> (${unpaidFines.length} штрафов):`;
                finesList.appendChild(userHeader);

                unpaidFines.forEach((fine, i) => {
                    const fineElement = document.createElement('div');
                    fineElement.className = 'fine-detail';
                    fineElement.textContent = `${i + 1}. ${fine.type} (${fine.date || 'дата неизвестна'})`;
                    finesList.appendChild(fineElement);
                });
            }
        }
    });

    if (finesList.children.length === 1) {
        finesList.innerHTML += '<p>Нет неоплаченных штрафов</p>';
    }
}

// Функция добавления штрафа
function addFine(index) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const fineTypes = [
        'Превышение скорости (10-20 км/ч) - 0.5 базовой величины',
        'Превышение скорости (20-30 км/ч) - 1 базовая величина',
        'Превышение скорости (30-40 км/ч) - 3 базовые величины',
        'Проезд на красный - от 1 до 5 базовой величины',
        'Парковка в неположенном месте - 1 базовая величина'
    ];

    const selectedFine = prompt(`Выберите тип штрафа:\n${fineTypes.map((type, i) => `${i + 1}. ${type}`).join('\n')}`);
    const fineIndex = parseInt(selectedFine, 10) - 1;

    if (fineIndex >= 0 && fineIndex < fineTypes.length) {
        users[index].fines = users[index].fines || [];
        users[index].fines.push({
            type: fineTypes[fineIndex],
            date: new Date().toLocaleDateString(),
            paid: false
        });

        localStorage.setItem('users', JSON.stringify(users));
        updateAdminPanel();
        alert('Штраф успешно добавлен!');
    }
}

// Функция удаления штрафа
function removeFine(index) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users[index];

    if (!user.fines || user.fines.length === 0) {
        alert('У пользователя нет штрафов.');
        return;
    }

    const fineList = user.fines.map((fine, i) => `${i + 1}. ${fine.type}`).join('\n');
    const selectedFine = prompt(`Выберите штраф для удаления:\n${fineList}`);
    const fineIndex = parseInt(selectedFine, 10) - 1;

    if (fineIndex >= 0 && fineIndex < user.fines.length) {
        user.fines.splice(fineIndex, 1);
        localStorage.setItem('users', JSON.stringify(users));
        updateAdminPanel();
        alert('Штраф успешно удален!');
    }
}

// Функция обновления админ-панели
function updateAdminPanel() {
    const adminContainer = document.querySelector('.admin-container');
    if (adminContainer) {
        const finesList = adminContainer.querySelector('.fines-list');
        updateFinesList(finesList);
        
        // Обновляем таблицу пользователей
        const tbody = adminContainer.querySelector('tbody');
        tbody.innerHTML = '';
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.forEach((user, index) => {
            if (user.role !== 'admin') {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.surname}</td>
                    <td>
                        <button class="admin-btn" onclick="addFine(${index})">Добавить штраф</button>
                        <button class="admin-btn" onclick="removeFine(${index})">Удалить штраф</button>
                    </td>
                `;
                tbody.appendChild(row);
            }
        });
    }
}

// Инициализация страницы
loadUserData();