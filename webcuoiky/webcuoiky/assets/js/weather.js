document.addEventListener('DOMContentLoaded', () => {
    // 🔥 Cấu hình Firebase
  const firebaseConfig = {
  apiKey: "AIzaSyBA_I3l7uIpLmRFQKh_tpcrwneAdIapO54",
  authDomain: "ttiot-5092c.firebaseapp.com",
  projectId: "ttiot-5092c",
  databaseURL: "https://ttiot-5092c-default-rtdb.firebaseio.com/",
  storageBucket: "ttiot-5092c.firebasestorage.app",
  messagingSenderId: "629031208722",
  appId: "1:629031208722:web:f2b55bb1158933002055cb",
  measurementId: "G-QHGGGW7N2Y"
};

    
    // Khởi tạo Firebase
 if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();
    
    // 🌤️ Dữ liệu mẫu ban đầu (nếu cần)
    const defaultData = {
        QuangNgai: {
            temperature: 32,
            humidity: 60,
            condition: "Nắng nhẹ",
            wind_speed: 15,
            pressure: 1012,
            visibility: 10
        },
        VinhLong: {
            temperature: 29,
            humidity: 70,
            condition: "Mưa rào",
            wind_speed: 12,
            pressure: 1008,
            visibility: 8
        },
        TienGiang: {
            temperature: 30,
            humidity: 65,
            condition: "Nhiều mây",
            wind_speed: 10,
            pressure: 1010,
            visibility: 9
        }
    };

    // 🖱️ Sự kiện mở modal
    document.querySelectorAll('.card__button[data-modal]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = button.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (!modal) return;

            modal.style.display = 'block';
           modal.querySelector('#weatherModalContent').innerHTML = getModalHTML();

// Trì hoãn gắn sự kiện một chút để đảm bảo DOM cập nhật xong
            setTimeout(() => {  
             attachModalEvents();
             setupFirebaseListeners();
                }, 100);

        });
    });

    // Đóng modal khi click ra ngoài
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // 💻 Giao diện HTML của modal (giữ nguyên như của bạn)
    function getModalHTML() {
        return `
        <span class="close">×</span>
        <div class="weather-container">
            <div class="weather-header">
                <h2>Cities Weather Information</h2>
            </div>
            <div class="weather-main">
                <div class="weather-sidebar">
                    <ul class="city-list">
                        <li class="city-item active" data-city="QuangNgai"><div class="city-name">Quảng Ngãi</div><div class="city-temp">--°C</div></li>
                        <li class="city-item" data-city="VinhLong"><div class="city-name">Vĩnh Long</div><div class="city-temp">--°C</div></li>
                        <li class="city-item" data-city="TienGiang"><div class="city-name">Tiền Giang</div><div class="city-temp">--°C</div></li>
                    </ul>
                </div>
                <div class="weather-display">
                    <div class="current-weather">
                        <img src="" class="weather-icon" alt="Weather Icon">
                        <div class="weather-temp">--°C</div>
                        <div class="weather-desc">Loading...</div>
                        <div class="weather-details">
                            <div class="detail-item"><span class="detail-icon">💧</span><span>Humidity: --%</span></div>
                            <div class="detail-item"><span class="detail-icon">🌬️</span><span>Wind: -- km/h</span></div>
                            <div class="detail-item"><span class="detail-icon">↘️</span><span>Pressure: -- hPa</span></div>
                            <div class="detail-item"><span class="detail-icon">👁️</span><span>Visibility: -- km</span></div>
                        </div>
                    </div>
                     <div class="city-image-container">
                        <img src="" class="city-image" alt="City Image" id="cityImage">
                    </div>
                </div>
            </div>
        </div>`;
    }

    // 📌 Gắn sự kiện trong modal (giữ nguyên)
    function attachModalEvents() {
        document.querySelector('#modal3 .close').addEventListener('click', () => {
            document.getElementById('modal3').style.display = 'none';
        });

        document.querySelectorAll('.city-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.city-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                const cityId = item.getAttribute('data-city');
                loadDataFromFirebase(cityId);
            });
        });
    }

    // 🔥 Thiết lập Firebase listeners
    function setupFirebaseListeners() {
    const cities = ['QuangNgai', 'VinhLong', 'TienGiang'];
    
    cities.forEach(city => {
        const ref = database.ref(`weather/${city}`);

        
        ref.on('value', (snapshot) => {
            const data = snapshot.val();
            console.log(`Data update for ${city}:`, data);
            
            if (!data) return;
            
            // Cập nhật UI cho thành phố đang active
            const activeCity = document.querySelector('.city-item.active');
            if (activeCity && activeCity.getAttribute('data-city') === city) {
                console.log(`Updating UI for active city: ${city}`);
                updateWeatherUI({
                    ...data,
                    icon: getWeatherIcon(data.condition)
                });
            }
            
            // Cập nhật nhiệt độ trong sidebar
            const tempItem = document.querySelector(`.city-item[data-city="${city}"] .city-temp`);
            if (tempItem) {
                tempItem.textContent = `${data.temperature}°C`;
                console.log(`Updated sidebar temp for ${city}`);
            }
        }, (error) => {
            console.error(`Listener error for ${city}:`, error);
        });
    });
    
    // Load dữ liệu ban đầu
    const activeCity = document.querySelector('.city-item.active');
    if (activeCity) {
        loadDataFromFirebase(activeCity.getAttribute('data-city'));
    }
}
    // 🔥 Load dữ liệu từ Firebase
    function loadDataFromFirebase(cityId) {
        database.ref(`weather/${cityId}`).once('value').then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                updateWeatherUI({
                    ...data,
                    icon: getWeatherIcon(data.condition)
                });
            } else {
                // Nếu không có dữ liệu, sử dụng dữ liệu mẫu
                updateWeatherUI({
                    ...defaultData[cityId],
                    icon: getWeatherIcon(defaultData[cityId]?.condition)
                });
            }
        }).catch((error) => {
            console.error("Error loading data from Firebase:", error);
            // Fallback to mock data if there's an error
            updateWeatherUI({
                ...defaultData[cityId],
                icon: getWeatherIcon(defaultData[cityId]?.condition)
            });
        });
    }

    // 🎯 Cập nhật UI (giữ nguyên)
    function updateWeatherUI(data) {
        document.querySelector('.weather-temp').textContent = `${data.temperature || '--'}°C`;
        document.querySelector('.weather-desc').textContent = data.condition || '--';
        document.querySelector('.weather-icon').src = data.icon || getWeatherIcon(null);

        const updateDetail = (selector, value) => {
            const el = document.querySelector(selector);
            if (el) el.textContent = value;
        };
        updateDetail('.detail-item:nth-child(1) span:last-child', `Humidity: ${data.humidity || '--'}%`);
        updateDetail('.detail-item:nth-child(2) span:last-child', `Wind: ${data.wind_speed || '--'} km/h`);
        updateDetail('.detail-item:nth-child(3) span:last-child', `Pressure: ${data.pressure || '--'} hPa`);
        updateDetail('.detail-item:nth-child(4) span:last-child', `Visibility: ${data.visibility || '--'} km`);
        const cityImage = document.getElementById('cityImage');
    if (cityImage) {
        const cityImages = {
            'QuangNgai': 'assets/img/quangngai.jpeg',
            'VinhLong': 'assets/img/vinh-long.jpg',
            'TienGiang': 'assets/img/tien-giang.jpg'
        };
        
        cityImage.src = cityImages[data.cityId || getActiveCity()] || 'assets/img/default-city.jpg';
        cityImage.alt = `${data.cityId || getActiveCity()} City View`;
    }
}

// Hàm helper để lấy thành phố đang active
function getActiveCity() {
    const activeItem = document.querySelector('.city-item.active');
    return activeItem ? activeItem.getAttribute('data-city') : null;
    }

    // 🌦️ Icon theo điều kiện (giữ nguyên)
    function getWeatherIcon(condition) {
        const c = (condition || '').toLowerCase();
        if (c.includes('nắng')) return 'https://openweathermap.org/img/wn/01d@2x.png';
        if (c.includes('mưa')) return 'https://openweathermap.org/img/wn/09d@2x.png';
        if (c.includes('mây')) return 'https://openweathermap.org/img/wn/03d@2x.png';
        return 'https://openweathermap.org/img/wn/01d@2x.png';
    }
});