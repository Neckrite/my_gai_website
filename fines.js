// Получение текущего пользователя
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Получение элементов страницы
const finesList = document.getElementById('finesList');
const authButton = document.getElementById('authButton');

// Загрузка штрафов
function loadFines() {
    const fines = currentUser?.fines || [];
    finesList.innerHTML = '';

    if (fines.length === 0) {
        finesList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">У вас нет неоплаченных штрафов</p>';
        return;
    }

    fines.forEach((fine, index) => {
        const fineElement = document.createElement('div');
        fineElement.className = 'fine';
        fineElement.innerHTML = `
            <div>
                <p><strong>${fine.type}</strong></p>
                <p>${fine.description || 'Нарушение ПДД'}</p>
            </div>
            <button onclick="payFine(${index})" ${fine.paid ? 'disabled' : ''}>
                ${fine.paid ? 'Оплачено' : 'Оплатить'}
            </button>
        `;
        finesList.appendChild(fineElement);
    });
}

// Оплата штрафа
function payFine(index) {
    if (!currentUser) return;
    
    const fines = currentUser.fines;
    if (fines[index].paid) {
        alert('Этот штраф уже оплачен.');
        return;
    }

    // Помечаем штраф как оплаченный
    fines[index].paid = true;
    currentUser.fines = fines;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Обновляем данные в панели администратора
    updateAdminFines(currentUser);

    // Перезагружаем список штрафов
    loadFines();
    
    // Создаем красивый alert
    const alertDiv = document.createElement('div');
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.left = '50%';
    alertDiv.style.transform = 'translateX(-50%)';
    alertDiv.style.backgroundColor = 'var(--secondary-color)';
    alertDiv.style.color = 'white';
    alertDiv.style.padding = '15px 30px';
    alertDiv.style.borderRadius = '5px';
    alertDiv.style.boxShadow = '0 4px 20px rgba(0, 168, 255, 0.5)';
    alertDiv.style.zIndex = '1000';
    alertDiv.style.animation = 'fadeIn 0.3s';
    alertDiv.textContent = 'Штраф успешно оплачен!';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'fadeOut 0.3s';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Обновление штрафов в панели администратора
function updateAdminFines(user) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === user.id);

    if (userIndex !== -1) {
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Проверка авторизации и настройка кнопки
function checkAuth() {
    if (!currentUser) {
        window.location.href = 'index.html';
    } else {
        authButton.textContent = `${currentUser.name} ${currentUser.surname}`;
        // Перенаправление в личный кабинет при клике
        authButton.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }
}

// Загрузка страницы
window.onload = () => {
    checkAuth();
    loadFines();
    
    // Добавляем стили для анимации alert
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translate(-50%, 0); }
            to { opacity: 0; transform: translate(-50%, -20px); }
        }
    `;
    document.head.appendChild(style);
};