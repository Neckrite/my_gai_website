const authContainer = document.getElementById('authContainer');
const logo = document.getElementById('logo');

// Анимация переключения форм
function switchForm(html) {
  authContainer.style.opacity = '0';
  setTimeout(() => {
    authContainer.innerHTML = html;
    authContainer.style.opacity = '1';
    bindNewEvents();
  }, 300);
}

// Привязка событий после переключения
function bindNewEvents() {
  const switchToRegister = document.getElementById('switchToRegister');
  const switchToLogin = document.getElementById('switchToLogin');
  
  if (switchToRegister) {
    switchToRegister.addEventListener('click', () => renderRegister());
  }
  if (switchToLogin) {
    switchToLogin.addEventListener('click', () => renderLogin());
  }
  
  const form = document.querySelector('form');
  if (form.id === 'loginForm') {
    form.addEventListener('submit', loginUser);
  } else if (form.id === 'registerForm') {
    form.addEventListener('submit', registerUser);
  }
}

// Форма регистрации
function renderRegister() {
  switchForm(`
    <h2>Регистрация</h2>
    <form id="registerForm">
      <input type="text" id="registerName" placeholder="Ваше имя" required>
      <input type="text" id="registerSurname" placeholder="Ваша фамилия" required>
      <input type="password" id="registerPassword" placeholder="Пароль" required>
      <input type="password" id="registerConfirmPassword" placeholder="Повторите пароль" required>
      <select id="registerRole">
        <option value="user">Пользователь</option>
        <option value="admin">Администратор</option>
      </select>
      <button type="submit">Зарегистрироваться</button>
    </form>
    <div class="switch-link" id="switchToLogin">Уже есть аккаунт? Войдите</div>
  `);
}

// Форма входа
function renderLogin() {
  switchForm(`
    <h2>Вход</h2>
    <form id="loginForm">
      <input type="text" id="loginName" placeholder="Имя" required>
      <input type="text" id="loginSurname" placeholder="Фамилия" required>
      <input type="password" id="loginPassword" placeholder="Пароль" required>
      <select id="loginRole">
        <option value="user">Пользователь</option>
        <option value="admin">Администратор</option>
      </select>
      <button type="submit">Войти</button>
    </form>
    <div class="switch-link" id="switchToRegister">Нет аккаунта? Зарегистрируйтесь</div>
  `);
}

// Проверка на буквы
function containsOnlyLetters(str) {
  return /^[a-zA-Zа-яА-Я]+$/.test(str);
}

// Регистрация
function registerUser(event) {
  event.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const surname = document.getElementById('registerSurname').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  const role = document.getElementById('registerRole').value;

  if (!containsOnlyLetters(name) || !containsOnlyLetters(surname)) {
    alert('Имя и фамилия могут содержать только буквы!');
    return;
  }

  if (name.length > 20 || surname.length > 20) {
    alert('Имя и фамилия не могут быть длиннее 20 символов!');
    return;
  }

  if (password.length > 20) {
    alert('Пароль не может быть длиннее 20 символов!');
    return;
  }

  if (password !== confirmPassword) {
    alert('Пароли не совпадают!');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userExists = users.some(user => user.name === name && user.surname === surname);
  
  if (userExists) {
    alert('Пользователь уже существует!');
    return;
  }

  if (role === 'admin' && users.some(user => user.role === 'admin')) {
    alert('Администратор уже зарегистрирован!');
    return;
  }

  users.push({ name, surname, password, role });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Регистрация успешна!');
  renderLogin();
}

// Вход
function loginUser(event) {
  event.preventDefault();
  const name = document.getElementById('loginName').value.trim();
  const surname = document.getElementById('loginSurname').value.trim();
  const password = document.getElementById('loginPassword').value;
  const role = document.getElementById('loginRole').value;

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.name === name && u.surname === surname && u.password === password && u.role === role);

  if (user) {
    alert(`Добро пожаловать, ${name} ${surname}!`);
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'index.html';
  } else {
    alert('Неверные данные!');
  }
}

// Переход на главную
logo.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Инициализация
document.getElementById('loginForm').addEventListener('submit', loginUser);
document.getElementById('switchToRegister').addEventListener('click', renderRegister);