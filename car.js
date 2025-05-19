// Инициализация данных
const cars = JSON.parse(localStorage.getItem('cars')) || [];
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const logo = document.getElementById('logo');

// Конфигурация
const CONFIG = {
  engineTypes: ['бензиновый', 'дизельный', 'электрический', 'гибрид'],
  minYear: 1886,
  maxYear: new Date().getFullYear() + 1,
  regNumberRegex: /^[0-9]{4}[A-Za-z]{2}-[0-9]$/,
  engineRegex: /^\d+(\.\d)?$/
};

// DOM элементы
const DOM = {
  regNumber: document.getElementById('regNumber'),
  alert: document.getElementById('alert'),
  carInfo: document.getElementById('carInfo'),
  addCarButton: document.getElementById('addCarButton'),
  addCarForm: document.getElementById('addCarForm'),
  formFields: {
    brand: document.getElementById('brand'),
    model: document.getElementById('model'),
    year: document.getElementById('year'),
    engine: document.getElementById('engine'),
    type: document.getElementById('type'),
    newRegNumber: document.getElementById('newRegNumber'),
    carImage: document.getElementById('carImage')
  }
};

// Утилиты
const Utils = {
  showAlert: (message, type = 'error') => {
    DOM.alert.textContent = message;
    DOM.alert.className = `alert ${type}`;
    setTimeout(() => DOM.alert.textContent = '', 5000);
  },

  clearForm: () => {
    Object.values(DOM.formFields).forEach(field => {
      if (field.type !== 'file') field.value = '';
      else field.value = null;
    });
  },

  validateEngineType: (type) => CONFIG.engineTypes.includes(type.toLowerCase()),

  formatCarInfo: (car) => `
    <p><strong>🚗 Марка:</strong> ${car.brand}</p>
    <p><strong>🔧 Модель:</strong> ${car.model}</p>
    <p><strong>📅 Год выпуска:</strong> ${car.year}</p>
    <p><strong>⚙️ Объём двигателя:</strong> ${car.engine} л</p>
    <p><strong>🔋 Тип двигателя:</strong> ${car.type}</p>
    <p><strong>🔢 Гос. номер:</strong> ${car.regNumber}</p>
    <img src="${car.image}" class="car-image" alt="Фото автомобиля">
  `
};

// Основные функции
function searchCar() {
  const regNumber = DOM.regNumber.value.trim();
  DOM.carInfo.innerHTML = '';
  DOM.addCarButton.style.display = 'none';

  if (!CONFIG.regNumberRegex.test(regNumber)) {
    Utils.showAlert('Неверный формат номера! Используйте формат: 1234AB-7');
    return;
  }

  const car = cars.find(c => c.regNumber === regNumber);

  if (car) {
    Utils.showAlert('Автомобиль найден!', 'success');
    let carHTML = Utils.formatCarInfo(car);

    if (currentUser?.role === 'admin') {
      carHTML += `
        <div class="admin-controls">
          <button class="delete-btn" 
                  onclick="deleteCar('${car.regNumber}')">
            🗑️ Удалить автомобиль
          </button>
        </div>
      `;
    }

    DOM.carInfo.innerHTML = carHTML;
    DOM.carInfo.classList.add('active');
  } else {
    Utils.showAlert('Автомобиль не найден');
    if (currentUser?.role === 'admin') {
      DOM.addCarButton.style.display = 'block';
    }
  }
}

function deleteCar(regNumber) {
  if (!confirm('Вы уверены, что хотите удалить этот автомобиль?')) return;

  const index = cars.findIndex(c => c.regNumber === regNumber);
  if (index !== -1) {
    cars.splice(index, 1);
    localStorage.setItem('cars', JSON.stringify(cars));
    Utils.showAlert('Автомобиль удален!', 'success');
    DOM.carInfo.classList.remove('active');
    DOM.regNumber.value = '';
  }
}

function showAddCarForm() {
  DOM.addCarButton.style.display = 'none';
  DOM.addCarForm.classList.add('active');
}

function hideAddCarForm() {
  DOM.addCarForm.classList.remove('active');
  Utils.clearForm();
}

async function addCar() {
  const formData = {
    brand: DOM.formFields.brand.value.trim(),
    model: DOM.formFields.model.value.trim(),
    year: parseInt(DOM.formFields.year.value.trim()),
    engine: DOM.formFields.engine.value.trim(),
    type: DOM.formFields.type.value.trim(),
    newRegNumber: DOM.formFields.newRegNumber.value.trim(),
    carImage: DOM.formFields.carImage.files[0]
  };

  // Валидация
  if (!CONFIG.regNumberRegex.test(formData.newRegNumber)) {
    Utils.showAlert('Неверный формат номера! Используйте формат: 1234AB-7');
    return;
  }

  if (!CONFIG.engineRegex.test(formData.engine)) {
    Utils.showAlert('Неверный формат объёма двигателя! Пример: 1.6 или 2.0');
    return;
  }

  if (formData.year < CONFIG.minYear || formData.year > CONFIG.maxYear) {
    Utils.showAlert(`Год выпуска должен быть между ${CONFIG.minYear} и ${CONFIG.maxYear}`);
    return;
  }

  if (!Utils.validateEngineType(formData.type)) {
    Utils.showAlert(`Допустимые типы двигателя: ${CONFIG.engineTypes.join(', ')}`);
    return;
  }

  if (cars.some(c => c.regNumber === formData.newRegNumber)) {
    Utils.showAlert('Автомобиль с таким номером уже существует!');
    return;
  }

  if (!formData.carImage) {
    Utils.showAlert('Пожалуйста, загрузите фото автомобиля');
    return;
  }

  try {
    const imageBase64 = await readFileAsDataURL(formData.carImage);
    const newCar = {
      ...formData,
      regNumber: formData.newRegNumber,
      image: imageBase64
    };

    cars.push(newCar);
    localStorage.setItem('cars', JSON.stringify(cars));
    
    Utils.showAlert('Автомобиль успешно добавлен!', 'success');
    hideAddCarForm();
    DOM.regNumber.value = formData.newRegNumber;
    searchCar();
  } catch (error) {
    Utils.showAlert('Ошибка при обработке изображения');
    console.error(error);
  }
}

// Вспомогательные функции
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Инициализация
if (currentUser?.role === 'admin') {
  DOM.addCarButton.style.display = 'block';
}

// Обработчики событий
logo.addEventListener('click', () => {
  window.location.href = 'index.html';
});