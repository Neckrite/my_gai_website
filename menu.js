// Получаем элементы интерфейса
const authButton = document.querySelector('.auth-button');
const finesButton = document.getElementById('finesButton');
const convertorButton = document.getElementById('convertorButton');
const historyButton = document.getElementById('historyButton');

// Проверка наличия текущего пользователя
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Обработка кнопки авторизации
if (currentUser) {
    // Если пользователь авторизован
    authButton.textContent = `${currentUser.name} ${currentUser.surname}`;
    authButton.style.cursor = 'pointer';
    authButton.addEventListener('click', () => {
        window.location.href = 'profile.html';
    });
} else {
    // Если пользователь не авторизован
    authButton.addEventListener('click', () => {
        window.location.href = 'entry.html';
    });
}

// Обработка перехода на страницы
finesButton.addEventListener('click', (event) => {
    if (!currentUser) {
        event.preventDefault();
        alert('Вы должны войти в аккаунт, чтобы получить доступ к странице!');
    } else {
        window.location.href = 'fines.html';
    }
});

convertorButton.addEventListener('click', (event) => {
    if (!currentUser) {
        event.preventDefault();
        alert('Вы должны войти в аккаунт, чтобы получить доступ к странице!');
    } else {
        window.location.href = 'car.html';
    }
});

historyButton.addEventListener('click', (event) => {
    if (!currentUser) {
        event.preventDefault();
        alert('Вы должны войти в аккакунт, чтобы получить доступ к странице!');
    } else {
        window.location.href = 'teh.html';
    }
});


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadNews();
    fetchWeather();
    setInterval(fetchWeather, 1800000); // Обновление каждые 30 минут
});

