// assets/js/script.js
// Firebase configuration
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


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
// Hàm cập nhật nhiệt độ điều hòa lên Firebase
function updateACTemperature(temp) {
  const tempValue = parseInt(temp);
  
  // Cập nhật lên Firebase BẤT KỂ trạng thái điều hòa
  firebase.database().ref('nhietdomaylanh').set(tempValue)
    .then(() => console.log(`✅ Đã cập nhật nhiệt độ lên Firebase: ${tempValue}°C`))
    .catch(error => console.error('❌ Lỗi Firebase:', error));

  // Luôn cập nhật giao diện
  const acTempValue = document.getElementById('acTempValue');
  if (acTempValue) {
    acTempValue.textContent = tempValue + '°C';
  }
  
  checkTemperatureWarning();
}
// Hàm hiển thị trang chi tiết
function showFullpage(location, title, img, description) {
  document.getElementById('dynamicContent').innerHTML = `
     <h1>${title}</h1>
     <p class="location">${location}</p>
     <img src="${img}" alt="${title}" class="detail-img" />
     <div class="description">${description}</div>
  `;
  document.getElementById('fullpageDetail').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// Hàm ẩn trang chi tiết
function hideFullpage() {
  document.getElementById('fullpageDetail').style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Chờ DOM tải xong
document.addEventListener('DOMContentLoaded', () => {
  // Gọi hàm cập nhật dữ liệu môi trường
  updateEnvironmentData();
  
  // Bắt đầu lắng nghe thay đổi thiết bị
  listenToDeviceChanges();
  
  // Xử lý modal
  const modals = document.querySelectorAll('.modal');
  const buttons = document.querySelectorAll('.card__button');
  const closeButtons = document.querySelectorAll('.close');
  let isSmartHomeModal = false;

  // Mở modal khi nhấn nút
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = button.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      
      // Kiểm tra nếu đây là modal Smart Home (modal2)
      isSmartHomeModal = modalId === 'modal2';
      
      modal.style.display = 'block';
    });
  });

  // Đóng modal khi nhấn nút "×"
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      modal.style.display = 'none';
      
      // Nếu đóng Smart Home modal, hiển thị bảng điều khiển
      if (isSmartHomeModal) {
        showDeviceControl();
        isSmartHomeModal = false;
      }
    });
  });

  // Đóng modal khi click ra ngoài
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
      
      // Nếu đóng Smart Home modal, hiển thị bảng điều khiển
      if (isSmartHomeModal) {
        showDeviceControl();
        isSmartHomeModal = false;
      }
    }
  });
  
  // Theo dõi thay đổi DOM để đảm bảo cảnh báo luôn hiển thị sau khi trang được tải
  setTimeout(() => {
    // Kiểm tra xem có cảnh báo nào chưa và tạo nếu chưa có
    forceShowTemperatureWarning();
  }, 1000);
});

// Hàm định dạng thời gian
function formatDateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  
  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

// Hàm kiểm tra và hiển thị cảnh báo nhiệt độ - Cách tiếp cận hoàn toàn mới
function checkTemperatureWarning() {
  console.log("Bắt đầu kiểm tra cảnh báo nhiệt độ");
  
  // 1. Lấy các phần tử cần thiết
  const warningElement = document.getElementById('temperatureWarning');
  const acTempSlider = document.getElementById('acTempSlider');
  const acStatus = document.getElementById('acStatus');
  
  // 2. Kiểm tra các phần tử có tồn tại không
  if (!warningElement || !acTempSlider || !acStatus) {
    console.error("Thiếu các phần tử UI cần thiết cho cảnh báo nhiệt độ:", {
      warningElement: !!warningElement,
      acTempSlider: !!acTempSlider,
      acStatus: !!acStatus
    });
    return;
  }
  
  // 3. Kiểm tra xem điều hòa có đang bật không
  const isACOn = acStatus.textContent.includes('Bật');
  
  // Nếu điều hòa đang tắt, ẩn cảnh báo và thoát
  if (!isACOn) {
    warningElement.style.display = 'none';
    return;
  }
  
  // 4. Lấy nhiệt độ hiện tại
  const currentTemp = parseInt(acTempSlider.value);
  console.log("Nhiệt độ hiện tại:", currentTemp + "°C");
  
  // 5. Cập nhật nhiệt độ hiển thị trong cảnh báo
  const warningTemp = warningElement.querySelector('.warning-temp');
  if (warningTemp) {
    warningTemp.textContent = currentTemp;
  }
  
  // 6. Xác định trạng thái dựa trên nhiệt độ
  const isVeryCold = currentTemp <= 23;
  const isGood = currentTemp >= 24 && currentTemp <= 26;
  const isWarm = currentTemp > 26 && currentTemp <= 28;
  const isVeryHot = currentTemp > 28;
  
  console.log("Trạng thái nhiệt độ:", 
    isVeryCold ? "Rất lạnh" : 
    isGood ? "Tốt" : 
    isWarm ? "Ấm" : "Rất nóng"
  );
  
  // Xóa tất cả các class cảnh báo có thể có
  warningElement.classList.remove('warning-normal', 'warning-high', 'warning-very-high');
  
  // Đặt style trực tiếp với !important
  warningElement.style.cssText = `
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    z-index: 100 !important;
  `;
  
  // 7. Phân loại và áp dụng kiểu dáng dựa trên nhiệt độ
  const warningTitle = warningElement.querySelector('.warning-title');
  const warningText = warningElement.querySelector('.warning-text');
  
  if (warningTitle && warningText) {
    if (isVeryCold) {
      // Nhiệt độ <= 23°C
      warningElement.classList.add('warning-normal');
      warningTitle.textContent = "TEMPERATURE ALERT: VERY COLD!";
      warningTitle.style.color = '#2196f3'; // Xanh nước biển
      warningText.innerHTML = `Nhiệt độ điều hòa đang ở mức <span class="warning-temp">${currentTemp}</span>°C. Nhiệt độ này quá lạnh, nên tăng lên mức 24-26°C để bảo vệ sức khỏe.`;
    } else if (isGood) {
      // Nhiệt độ 24-26°C
      warningElement.classList.add('warning-normal');
      warningTitle.textContent = "NORMAL OPERATION";
      warningTitle.style.color = '#4CAF50'; // Xanh lá cây
      warningText.innerHTML = `Nhiệt độ điều hòa đang ở mức <span class="warning-temp">${currentTemp}</span>°C. Đây là mức nhiệt độ lý tưởng, tiết kiệm năng lượng và tốt cho sức khỏe.`;
    } else if (isWarm) {
      // Nhiệt độ 26-28°C
      warningElement.classList.add('warning-high');
      warningTitle.textContent = "TEMPERATURE WARNING: WARM!";
      warningTitle.style.color = '#ffc107'; // Vàng
      warningText.innerHTML = `Nhiệt độ điều hòa đang ở mức <span class="warning-temp">${currentTemp}</span>°C. Nhiệt độ này hơi ấm, nên giảm xuống mức 24-26°C để tiết kiệm năng lượng.`;
    } else {
      // Nhiệt độ > 28°C
      warningElement.classList.add('warning-very-high');
      warningTitle.textContent = "TEMPERATURE ALERT: VERY HOT!";
      warningTitle.style.color = '#dc3545'; // Đỏ
      warningText.innerHTML = `Nhiệt độ điều hòa đang ở mức <span class="warning-temp">${currentTemp}</span>°C. Nhiệt độ này quá nóng, nên giảm xuống mức 24-26°C để tiết kiệm năng lượng và bảo vệ sức khỏe.`;
    }
  }
  
  console.log("Đã cập nhật cảnh báo nhiệt độ xong");
}

// Hàm tạo lại cảnh báo nếu không tìm thấy
function recreateWarningElement() {
  console.warn("Đang tạo lại phần tử cảnh báo nhiệt độ...");
  
  // Tạo container mới
  const warningElement = document.createElement('div');
  warningElement.id = 'temperatureWarning';
  warningElement.className = 'temperature-warning';
  warningElement.style.cssText = 'display: flex !important; visibility: visible !important; opacity: 1 !important;';
  
  // Tạo nội dung HTML bên trong
  warningElement.innerHTML = `
    <div class="warning-icon">⚠️</div>
    <div class="warning-content">
      <h4 class="warning-title">NORMAL OPERATION</h4>
      <p class="warning-text">Nhiệt độ điều hòa hiện đang ở mức <span class="warning-temp">24</span>°C. Đây là mức nhiệt độ tiết kiệm năng lượng và tốt cho sức khỏe.</p>
    </div>
  `;
  
  // Tìm phần tử cha để chèn vào
  const controlPanel = document.querySelector('.control-panel');
  if (controlPanel) {
    // Chèn vào cuối control panel
    controlPanel.appendChild(warningElement);
    console.log("Đã tạo mới phần tử cảnh báo nhiệt độ");
    
    // Gọi lại hàm kiểm tra sau khi tạo mới
    setTimeout(checkTemperatureWarning, 100);
  } else {
    console.error("Không tìm thấy control panel để chèn cảnh báo nhiệt độ mới");
  }
}

// Hàm tạo hiệu ứng nháy màu cho cảnh báo
function flashWarning(element, color1, color2) {
  // Tạo animation nháy màu
  try {
    element.animate(
      [
        { backgroundColor: color1 },
        { backgroundColor: color2 },
        { backgroundColor: color1 }
      ],
      {
        duration: 1000,
        iterations: 3
      }
    );
  } catch (error) {
    console.error("Trình duyệt không hỗ trợ Web Animation API:", error);
    // Fallback cho trình duyệt không hỗ trợ Web Animation API
    let iteration = 0;
    const maxIterations = 6;
    const interval = setInterval(() => {
      element.style.backgroundColor = iteration % 2 === 0 ? color2 : color1;
      iteration++;
      if (iteration >= maxIterations) {
        clearInterval(interval);
      }
    }, 500);
  }
}

// Hàm hiển thị thông báo cảnh báo ngay lập tức
function showTemperatureAlert(temperature) {
  // Kiểm tra xem đã có thông báo chưa
  const existingAlert = document.querySelector('.temp-alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  // Tạo và hiển thị thông báo pop-up
  const alertBox = document.createElement('div');
  alertBox.className = 'temp-alert';
  
  // Xác định loại thông báo dựa vào nhiệt độ
  let alertClass = '';
  let alertIcon = '';
  let alertMessage = '';
  
  if (temperature > 28) {
    alertClass = 'danger';
    alertIcon = '🔥';
    alertMessage = 'Nhiệt độ quá cao!';
  } else if (temperature > 27) {
    alertClass = 'warning';
    alertIcon = '⚠️';
    alertMessage = 'Nhiệt độ cao!';
  } else {
    alertClass = 'success';
    alertIcon = '✓';
    alertMessage = 'Nhiệt độ lý tưởng';
  }
  
  alertBox.classList.add(alertClass);
  alertBox.innerHTML = `
    <span class="alert-icon">${alertIcon}</span>
    <span class="alert-message">${alertMessage} (${temperature}°C)</span>
    <span class="alert-close">×</span>
  `;
  
  // Thêm vào body
  document.body.appendChild(alertBox);
  
  // Thêm sự kiện đóng thông báo
  alertBox.querySelector('.alert-close').addEventListener('click', () => {
    alertBox.classList.remove('show');
    setTimeout(() => {
      if (alertBox.parentNode) {
        alertBox.parentNode.removeChild(alertBox);
      }
    }, 300);
  });
  
  // Hiệu ứng hiển thị
  setTimeout(() => {
    alertBox.classList.add('show');
  }, 10);
  
  // Tự động xóa sau 3 giây
  setTimeout(() => {
    if (alertBox && alertBox.classList.contains('show')) {
      alertBox.classList.remove('show');
      setTimeout(() => {
        if (alertBox.parentNode) {
          alertBox.parentNode.removeChild(alertBox);
        }
      }, 300);
    }
  }, 3000);
}

// Biến lưu trữ đồ thị
let powerChart;

// Tạo đồ thị công suất tiêu thụ
function createPowerConsumptionChart() {
  const canvas = document.getElementById('powerConsumptionChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Dữ liệu ban đầu
  const initialData = {
    labels: ['Điều hòa', 'Quạt', 'TV', 'Đèn'],
    datasets: [{
      label: 'Công suất (W)',
      data: calculatePowerConsumption(),
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  };
  
  // Nếu đã có biểu đồ trước đó, hủy nó
  if (powerChart) {
    powerChart.destroy();
  }
  
  // Tạo biểu đồ mới
  powerChart = new Chart(ctx, {
    type: 'bar',
    data: initialData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Công suất (W)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Thiết bị'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Công suất tiêu thụ của các thiết bị',
          font: {
            size: 16
          }
        },
        legend: {
          display: false
        }
      }
    }
  });
}

// Cập nhật đồ thị công suất khi có thay đổi
function updatePowerConsumptionChart() {
  if (powerChart) {
    try {
      powerChart.data.datasets[0].data = calculatePowerConsumption();
      powerChart.update();
    } catch (error) {
      console.error("Lỗi khi cập nhật đồ thị:", error);
    }
  }
}

// Tính toán công suất tiêu thụ cho từng thiết bị
function calculatePowerConsumption() {
  // Kiểm tra xem các phần tử có tồn tại không
  const acStatusElement = document.getElementById('acStatus');
  const fanStatusElement = document.getElementById('fanStatus');
  const tvStatusElement = document.getElementById('tvStatus');
  const lightStatusElement = document.getElementById('lightStatus');
  
  if (!acStatusElement || !fanStatusElement || !tvStatusElement || !lightStatusElement) {
    return [0, 0, 0, 0];
  }
  
  // Kiểm tra trạng thái thiết bị
  const acStatus = acStatusElement.textContent.includes('Bật');
  const fanStatus = fanStatusElement.textContent.includes('Bật');
  const tvStatus = tvStatusElement.textContent.includes('Bật');
  const lightStatus = lightStatusElement.textContent.includes('Bật');
  
  // Lấy giá trị từ thanh trượt
  const acTempElement = document.getElementById('acTempSlider');
  const fanSpeedElement = document.getElementById('fanSpeedSlider');
  const tvVolumeElement = document.getElementById('tvVolumeSlider');
  const lightBrightnessElement = document.getElementById('lightBrightnessSlider');
  
  if (!acTempElement || !fanSpeedElement || !tvVolumeElement || !lightBrightnessElement) {
    return [0, 0, 0, 0];
  }
  
  const acTemp = parseInt(acTempElement.value) || 24;
  const fanSpeed = parseInt(fanSpeedElement.value) || 3;
  const tvVolume = parseInt(tvVolumeElement.value) || 50;
  const lightBrightness = parseInt(lightBrightnessElement.value) || 70;
  
  // Tính toán công suất
  const acPower = acStatus ? 800 + (30 - acTemp) * 50 : 0;  // Công suất tăng khi nhiệt độ giảm
  const fanPower = fanStatus ? 30 + fanSpeed * 10 : 0;      // Công suất tăng theo tốc độ
  const tvPower = tvStatus ? 100 + tvVolume * 0.5 : 0;      // Công suất tăng theo âm lượng
  const lightPower = lightStatus ? lightBrightness * 0.5 : 0; // Công suất tăng theo độ sáng
  
  return [acPower, fanPower, tvPower, lightPower];
}

// Cập nhật đồng hồ trong bảng điều khiển thiết bị
function updateDeviceClock() {
  const clockElement = document.getElementById('device-clock');
  if (clockElement) {
    clockElement.textContent = formatDateTime();
    
    // Cập nhật mỗi giây
    setTimeout(updateDeviceClock, 1000);
  }
}

// Hàm để bật/tắt thiết bị
function toggleDevice(deviceType, imageId, statusId) {
  const img = document.getElementById(imageId);
  const status = document.getElementById(statusId);
  
  if (!img || !status) return;
  
  const isOn = img.src.includes(`${deviceType}_on.gif`);
  const newState = !isOn;
  
  // Cập nhật giao diện
  if (newState) {
    img.src = `assets/img/${deviceType}_on.gif`;
    status.textContent = 'Trạng thái: Bật';
    
    // Nếu là máy lạnh: đồng bộ nhiệt độ hiện tại lên Firebase khi BẬT
    if (deviceType === 'ac') {
      const tempSlider = document.getElementById('acTempSlider');
      if (tempSlider) {
        updateACTemperature(tempSlider.value); // Gọi hàm cập nhật
      }
    }
  } else {
    img.src = `assets/img/${deviceType}_off.png`;
    status.textContent = 'Trạng thái: Tắt';
  }
  
  // Cập nhật trạng thái bật/tắt lên Firebase
  const firebaseKey = deviceType === 'ac' ? 'maylanh' : 
                     deviceType === 'fan' ? 'fan' : 
                     deviceType === 'tv' ? 'tv' : 
                     'light';
  
  firebase.database().ref(firebaseKey).set(newState ? 'on' : 'off');
}

// Hàm buộc hiển thị cảnh báo nhiệt độ khi DOM đã sẵn sàng
function forceShowTemperatureWarning() {
  console.log("Đang buộc hiển thị cảnh báo nhiệt độ...");
  
  // Lấy tham chiếu đến các phần tử cần thiết
  const warningElement = document.getElementById('temperatureWarning');
  const acTempSlider = document.getElementById('acTempSlider');
  
  if (!warningElement || !acTempSlider) {
    console.error("Không thể buộc hiển thị cảnh báo: thiếu các phần tử cần thiết");
    
    // Nếu không tìm thấy cảnh báo, gọi hàm tạo mới và thoát
    recreateWarningElement();
    return;
  }
  
  // Đặt style trực tiếp để đảm bảo hiển thị
  warningElement.style.cssText = `
    display: flex !important; 
    visibility: visible !important; 
    opacity: 1 !important;
    position: relative !important;
    z-index: 100 !important;
  `;
  
  // Gọi hàm kiểm tra cảnh báo để cập nhật nội dung
  checkTemperatureWarning();
}

// Hàm hiển thị bảng điều khiển thiết bị
function showDeviceControl() {
  const fullpageDetail = document.getElementById('fullpageDetail');
  
  // Xóa nội dung cũ
  while (fullpageDetail.firstChild) {
    fullpageDetail.removeChild(fullpageDetail.firstChild);
  }
  
  // Tạo container cho các phòng
  const roomContainer = document.createElement('div');
  roomContainer.className = 'room-container';
  
  // Tạo các thẻ phòng
  const rooms = [
    {
      id: 'living',
      name: 'Phòng Khách',
      icon: 'assets/img/living.gif',
      temp: '--°C',
      humidity: '--%',
      status: 'Bình thường'
    },
    {
      id: 'bedroom',
      name: 'Phòng Ngủ',
      icon: 'assets/img/bed.gif',
      temp: '--°C',
      humidity: '--%',
      status: 'Bình thường'
    },
    {
      id: 'kitchen',
      name: 'Phòng Bếp',
      icon: 'assets/img/cook.gif',
      temp: '--°C',
      humidity: '--%',
      status: 'Bình thường'
    }
  ];
  
  rooms.forEach(room => {
    const roomCard = document.createElement('div');
    roomCard.className = 'room-card';
    roomCard.innerHTML = `
      <div class="room-card-header">
        <img src="${room.icon}" alt="${room.name}" class="room-icon">
        <h3>${room.name}</h3>
      </div>
      <div class="room-basic-info">
        <div class="room-temp">
          <span class="label">Nhiệt độ:</span>
          <span id="${room.id}-temp" class="value">${room.temp}</span>
        </div>
        <div class="room-humidity">
          <span class="label">Độ ẩm:</span>
          <span id="${room.id}-humidity" class="value">${room.humidity}</span>
        </div>
      </div>
      <div class="room-details">
        <div class="room-status">
          <span class="label">Trạng thái:</span>
          <span id="${room.id}-status" class="value">${room.status}</span>
        </div>
        <div class="room-warning" id="${room.id}-warning"></div>
      </div>
    `;
    
    // Thêm sự kiện click để mở/đóng chi tiết
    roomCard.addEventListener('click', function() {
      this.classList.toggle('active');
    });
    
    roomContainer.appendChild(roomCard);
  });
  
  // Tạo bảng điều khiển
  const controlPanel = document.createElement('div');
  controlPanel.className = 'control-panel';
  controlPanel.innerHTML = `
    <div class="control-header">
      <div class="header-left">
        <button class="back-button">← Back</button>
        <h2 class="control-title">Bảng Điều Khiển Thiết Bị</h2>
      </div>
      <div class="environment-data">
        <p>Nhiệt độ môi trường: <span id="environmentTemp">--°C</span></p>
        <p>Độ ẩm: <span id="humidityValue">--%</span></p>
      </div>
      <div id="device-clock" class="device-clock">${formatDateTime()}</div>
    </div>
    
    <div class="control-content">
      <div class="device-controls">
        <!-- Điều hòa -->
        <div class="device-item">
          <h3>Điều hòa</h3>
          <button id="acToggleBtn" class="device-btn">
            <img id="acImage" src="assets/img/ac_off.png" alt="AC Off" class="device-img">
          </button>
          <p id="acStatus" class="device-status">Trạng thái: Tắt</p>
          <div class="device-slider-control">
            <span>Nhiệt độ: </span>
            <input type="range" min="16" max="30" value="24" class="slider" id="acTempSlider">
            <span id="acTempValue">24°C</span>
          </div>
        </div>
        
        <!-- Quạt -->
        <div class="device-item">
          <h3>Quạt</h3>
          <button id="fanToggleBtn" class="device-btn">
            <img id="fanImage" src="assets/img/fan_off.png" alt="Fan Off" class="device-img">
          </button>
          <p id="fanStatus" class="device-status">Trạng thái: Tắt</p>
          <div class="device-slider-control">
            <span>Tốc độ: </span>
            <input type="range" min="1" max="5" value="3" class="slider" id="fanSpeedSlider">
            <span id="fanSpeedValue">3</span>
          </div>
        </div>
        
        <!-- TV -->
        <div class="device-item">
          <h3>TV</h3>
          <button id="tvToggleBtn" class="device-btn">
            <img id="tvImage" src="assets/img/tv_off.png" alt="TV Off" class="device-img">
          </button>
          <p id="tvStatus" class="device-status">Trạng thái: Tắt</p>
          <div class="device-slider-control">
            <span>Âm lượng: </span>
            <input type="range" min="0" max="100" value="50" class="slider" id="tvVolumeSlider">
            <span id="tvVolumeValue">50%</span>
          </div>
        </div>
        
        <!-- Đèn -->
        <div class="device-item">
          <h3>Đèn</h3>
          <button id="lightToggleBtn" class="device-btn">
            <img id="lightImage" src="assets/img/light_off.png" alt="Light Off" class="device-img">
          </button>
          <p id="lightStatus" class="device-status">Trạng thái: Tắt</p>
          <div class="device-slider-control">
            <span>Độ sáng: </span>
            <input type="range" min="10" max="100" value="70" class="slider" id="lightBrightnessSlider">
            <span id="lightBrightnessValue">70%</span>
          </div>
        </div>
      </div>
      
      <!-- Phần đồ thị công suất tiêu thụ -->
      <div class="power-consumption-section">
        <h3>Biểu đồ công suất tiêu thụ</h3>
        <div class="chart-container">
          <canvas id="powerConsumptionChart"></canvas>
        </div>
        <!-- Thêm các nút chế độ -->
        <div class="mode-controls-vertical">
          <button id="mode1" class="mode-button">ON</button>
          <button id="mode2" class="mode-button">Mode</button>
          <button id="exitMode" class="mode-button">OFF</button>
        </div>
      </div>
    </div>
    
    <!-- Phần cảnh báo nhiệt độ -->
    <div id="temperatureWarning" class="temperature-warning">
      <div class="warning-icon">⚠️</div>
      <div class="warning-content">
        <h4 class="warning-title">NORMAL OPERATION</h4>
        <p class="warning-text">Nhiệt độ điều hòa hiện đang ở mức <span class="warning-temp">24</span>°C. Đây là mức nhiệt độ tiết kiệm năng lượng và tốt cho sức khỏe.</p>
      </div>
    </div>
  `;
  
  // Thêm các container vào fullpageDetail
  fullpageDetail.appendChild(roomContainer);
  fullpageDetail.appendChild(controlPanel);
  
  // Hiển thị fullpageDetail
  fullpageDetail.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Cập nhật đồng hồ và dữ liệu
  updateDeviceClock();
  updateEnvironmentData();
  
  // Chờ một chút trước khi tạo đồ thị và hiển thị cảnh báo
  setTimeout(() => {
    try {
      createPowerConsumptionChart();
      console.log("Đang kiểm tra cảnh báo nhiệt độ khi khởi tạo...");
      checkTemperatureWarning();
    } catch (error) {
      console.error("Lỗi khi khởi tạo:", error);
    }
  }, 500);
  
  // Thêm sự kiện cho các nút chế độ
  const mode1Button = document.getElementById('mode1');
  const mode2Button = document.getElementById('mode2');
  const exitButton = document.getElementById('exitMode');

  // Mode 1: Quạt cấp 5, TV âm lượng 50%, Điều hòa 24°C, các thiết bị khác tắt
  mode1Button.addEventListener('click', () => {
    // Bật điều hòa 24°C
    const acToggleBtn = document.getElementById('acToggleBtn');
    if (acToggleBtn) {
      const acImage = document.getElementById('acImage');
      const acStatus = document.getElementById('acStatus');
      if (acImage && acStatus) {
        acImage.src = 'assets/img/ac_on.gif';
        acStatus.textContent = 'Trạng thái: Bật';
      }
      const acTempSlider = document.getElementById('acTempSlider');
      if (acTempSlider) {
        acTempSlider.value = 24;
        const acTempValue = document.getElementById('acTempValue');
        if (acTempValue) {
          acTempValue.textContent = '24°C';
        }
      }
    }

    // Bật quạt cấp 5
    const fanToggleBtn = document.getElementById('fanToggleBtn');
    if (fanToggleBtn) {
      const fanImage = document.getElementById('fanImage');
      const fanStatus = document.getElementById('fanStatus');
      if (fanImage && fanStatus) {
        fanImage.src = 'assets/img/fan_on.gif';
        fanStatus.textContent = 'Trạng thái: Bật';
      }
      const fanSlider = document.getElementById('fanSpeedSlider');
      if (fanSlider) {
        fanSlider.value = 5;
        const fanValue = document.getElementById('fanSpeedValue');
        if (fanValue) {
          fanValue.textContent = '5';
        }
      }
    }

    // Bật TV âm lượng 50%
    const tvToggleBtn = document.getElementById('tvToggleBtn');
    if (tvToggleBtn) {
      const tvImage = document.getElementById('tvImage');
      const tvStatus = document.getElementById('tvStatus');
      if (tvImage && tvStatus) {
        tvImage.src = 'assets/img/tv_on.gif';
        tvStatus.textContent = 'Trạng thái: Bật';
      }
      const tvSlider = document.getElementById('tvVolumeSlider');
      if (tvSlider) {
        tvSlider.value = 50;
        const tvValue = document.getElementById('tvVolumeValue');
        if (tvValue) {
          tvValue.textContent = '50%';
        }
      }
    }

    // Bật đèn 50%
    const lightToggleBtn = document.getElementById('lightToggleBtn');
    if (lightToggleBtn) {
      const lightImage = document.getElementById('lightImage');
      const lightStatus = document.getElementById('lightStatus');
      if (lightImage && lightStatus) {
        lightImage.src = 'assets/img/light_on.gif';
        lightStatus.textContent = 'Trạng thái: Bật';
      }
      const lightSlider = document.getElementById('lightBrightnessSlider');
      if (lightSlider) {
        lightSlider.value = 50;
        const lightValue = document.getElementById('lightBrightnessValue');
        if (lightValue) {
          lightValue.textContent = '50%';
        }
      }
    }

    mode1Button.classList.add('active');
    mode2Button.classList.remove('active');
    updatePowerConsumptionChart();
    checkTemperatureWarning();
  });

  // Mode 2: Điều hòa 28°C, TV âm lượng 70%, Đèn 100%, Quạt cấp 3
  mode2Button.addEventListener('click', () => {
    // Bật điều hòa 28°C
    const acToggleBtn = document.getElementById('acToggleBtn');
    if (acToggleBtn) {
      const acImage = document.getElementById('acImage');
      const acStatus = document.getElementById('acStatus');
      if (acImage && acStatus) {
        acImage.src = 'assets/img/ac_on.gif';
        acStatus.textContent = 'Trạng thái: Bật';
      }
      // Trong hàm showDeviceControl(), tìm phần xử lý thanh trượt nhiệt độ và thay bằng:
// Xử lý thanh trượt nhiệt độ điều hòa
// Gán sự kiện cho thanh trượt nhiệt độ
// Gán sự kiện cho thanh trượt nhiệt độ
// Trong phần xử lý thanh trượt (tìm đoạn code có acTempSlider)
const acTempSlider = document.getElementById('acTempSlider');
if (acTempSlider) {
  // Hàm xử lý khi nhiệt độ thay đổi
  const handleTemperatureChange = () => {
    const tempValue = acTempSlider.value;
    updateACTemperature(tempValue); // Gọi hàm cập nhật Firebase
    
    // Các xử lý khác (nếu có)
    if (parseInt(tempValue) > 27) {
      acTempSlider.style.background = 'linear-gradient(to right, #4caf50, #ff9800, #f44336)';
    } else {
      acTempSlider.style.background = '#d3d3d3';
    }
  };

  // Thêm sự kiện
  acTempSlider.addEventListener('input', handleTemperatureChange); // Khi kéo
  acTempSlider.addEventListener('change', handleTemperatureChange); // Khi thả
}
    }

    // Bật quạt cấp 3
    const fanToggleBtn = document.getElementById('fanToggleBtn');
    if (fanToggleBtn) {
      const fanImage = document.getElementById('fanImage');
      const fanStatus = document.getElementById('fanStatus');
      if (fanImage && fanStatus) {
        fanImage.src = 'assets/img/fan_on.gif';
        fanStatus.textContent = 'Trạng thái: Bật';
      }
      const fanSlider = document.getElementById('fanSpeedSlider');
      if (fanSlider) {
        fanSlider.value = 3;
        const fanValue = document.getElementById('fanSpeedValue');
        if (fanValue) {
          fanValue.textContent = '3';
        }
      }
    }

    // Bật TV âm lượng 70%
    const tvToggleBtn = document.getElementById('tvToggleBtn');
    if (tvToggleBtn) {
      const tvImage = document.getElementById('tvImage');
      const tvStatus = document.getElementById('tvStatus');
      if (tvImage && tvStatus) {
        tvImage.src = 'assets/img/tv_on.gif';
        tvStatus.textContent = 'Trạng thái: Bật';
      }
      const tvSlider = document.getElementById('tvVolumeSlider');
      if (tvSlider) {
        tvSlider.value = 70;
        const tvValue = document.getElementById('tvVolumeValue');
        if (tvValue) {
          tvValue.textContent = '70%';
        }
      }
    }

    // Bật đèn 100%
    const lightToggleBtn = document.getElementById('lightToggleBtn');
    if (lightToggleBtn) {
      const lightImage = document.getElementById('lightImage');
      const lightStatus = document.getElementById('lightStatus');
      if (lightImage && lightStatus) {
        lightImage.src = 'assets/img/light_on.gif';
        lightStatus.textContent = 'Trạng thái: Bật';
      }
      const lightSlider = document.getElementById('lightBrightnessSlider');
      if (lightSlider) {
        lightSlider.value = 100;
        const lightValue = document.getElementById('lightBrightnessValue');
        if (lightValue) {
          lightValue.textContent = '100%';
        }
      }
    }

    mode2Button.classList.add('active');
    mode1Button.classList.remove('active');
    updatePowerConsumptionChart();
    checkTemperatureWarning();
  });

  // Exit: Tắt tất cả thiết bị
  exitButton.addEventListener('click', () => {
    // Tắt điều hòa
    const acToggleBtn = document.getElementById('acToggleBtn');
    if (acToggleBtn) {
      const acImage = document.getElementById('acImage');
      const acStatus = document.getElementById('acStatus');
      if (acImage && acStatus) {
        acImage.src = 'assets/img/ac_off.png';
        acStatus.textContent = 'Trạng thái: Tắt';
        // Ẩn cảnh báo nhiệt độ khi tắt điều hòa
        const warningElement = document.getElementById('temperatureWarning');
        if (warningElement) {
          warningElement.style.display = 'none';
        }
      }
    }

    // Tắt quạt
    const fanToggleBtn = document.getElementById('fanToggleBtn');
    if (fanToggleBtn) {
      const fanImage = document.getElementById('fanImage');
      const fanStatus = document.getElementById('fanStatus');
      if (fanImage && fanStatus) {
        fanImage.src = 'assets/img/fan_off.png';
        fanStatus.textContent = 'Trạng thái: Tắt';
      }
    }

    // Tắt TV
    const tvToggleBtn = document.getElementById('tvToggleBtn');
    if (tvToggleBtn) {
      const tvImage = document.getElementById('tvImage');
      const tvStatus = document.getElementById('tvStatus');
      if (tvImage && tvStatus) {
        tvImage.src = 'assets/img/tv_off.png';
        tvStatus.textContent = 'Trạng thái: Tắt';
      }
    }

    // Tắt đèn
    const lightToggleBtn = document.getElementById('lightToggleBtn');
    if (lightToggleBtn) {
      const lightImage = document.getElementById('lightImage');
      const lightStatus = document.getElementById('lightStatus');
      if (lightImage && lightStatus) {
        lightImage.src = 'assets/img/light_off.png';
        lightStatus.textContent = 'Trạng thái: Tắt';
      }
    }

    mode1Button.classList.remove('active');
    mode2Button.classList.remove('active');
    updatePowerConsumptionChart();
  });
  
  // Gán sự kiện cho nút Back
  document.querySelector('.back-button').addEventListener('click', () => {
    fullpageDetail.style.display = 'none';
    document.body.style.overflow = 'auto';
  });
  
  // Gán sự kiện bật/tắt điều hòa
  document.getElementById('acToggleBtn').addEventListener('click', () => {
    toggleDevice('ac', 'acImage', 'acStatus');
    updatePowerConsumptionChart();
    console.log("Đang kiểm tra cảnh báo nhiệt độ sau khi bấm nút điều hòa...");
    checkTemperatureWarning();
  });
  
  // Gán sự kiện bật/tắt quạt
  document.getElementById('fanToggleBtn').addEventListener('click', () => {
    toggleDevice('fan', 'fanImage', 'fanStatus');
    updatePowerConsumptionChart();
  });
  
  // Gán sự kiện bật/tắt TV
  document.getElementById('tvToggleBtn').addEventListener('click', () => {
    toggleDevice('tv', 'tvImage', 'tvStatus');
    updatePowerConsumptionChart();
  });
  
  // Gán sự kiện bật/tắt đèn
  document.getElementById('lightToggleBtn').addEventListener('click', () => {
    toggleDevice('light', 'lightImage', 'lightStatus');
    updatePowerConsumptionChart();
  });
  
  // Gán sự kiện cho thanh trượt nhiệt độ
  const acTempSlider = document.getElementById('acTempSlider');
  if (acTempSlider) {
    // Thiết lập giá trị ban đầu
    acTempSlider.value = 24;
    
    // Hàm xử lý khi nhiệt độ thay đổi
    function handleTemperatureChange() {
      const tempValue = acTempSlider.value;
      const acTempValueElement = document.getElementById('acTempValue');
      if (acTempValueElement) {
        acTempValueElement.textContent = tempValue + '°C';
      }
      
      // Cập nhật đồ thị và cảnh báo
      updatePowerConsumptionChart();
      console.log("NHIỆT ĐỘ THAY ĐỔI THÀNH:", tempValue + "°C");
      
      // Gọi hàm kiểm tra nhiệt độ để cập nhật cảnh báo
      checkTemperatureWarning();
      
      // Kiểm tra và thay đổi màu background của thanh trượt
      if (parseInt(tempValue) > 27) {
        acTempSlider.style.background = 'linear-gradient(to right, #4caf50, #ff9800, #f44336)';
      } else {
        acTempSlider.style.background = '#d3d3d3';
      }
    }
    
    // Sự kiện khi kéo thanh trượt
    acTempSlider.addEventListener('input', handleTemperatureChange);
    
    // Sự kiện khi thả thanh trượt
    acTempSlider.addEventListener('change', handleTemperatureChange);
    
    // Thêm tính năng tăng/giảm nhanh nhiệt độ để kiểm tra
    acTempSlider.addEventListener('dblclick', function(e) {
      // Xác định vị trí nhấp chuột
      const rect = this.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const sliderWidth = rect.width;
      
      // Tính toán giá trị nhiệt độ dựa trên vị trí nhấp chuột
      const min = parseInt(this.min);
      const max = parseInt(this.max);
      const newTemp = Math.round(min + (clickPosition / sliderWidth) * (max - min));
      
      console.log("Đã nhấp đúp chuột để đặt nhiệt độ thành:", newTemp + "°C");
      
      // Cập nhật giá trị thanh trượt
      this.value = newTemp;
      
      // Gọi hàm xử lý
      handleTemperatureChange();
    });
    
    // Thêm các nút điều chỉnh nhanh cho nhiệt độ
    const acControlPanel = acTempSlider.closest('.device-item');
    if (acControlPanel) {
      const quickButtons = document.createElement('div');
      quickButtons.className = 'quick-temp-buttons';
      quickButtons.innerHTML = `
        <button class="temp-btn" data-temp="24">24°C</button>
        <button class="temp-btn" data-temp="26">26°C</button>
        <button class="temp-btn" data-temp="27">27°C</button>
        <button class="temp-btn warning" data-temp="28">28°C</button>
        <button class="temp-btn danger" data-temp="30">30°C</button>
      `;
      
      // Chèn vào sau thanh trượt
      const sliderControl = acControlPanel.querySelector('.device-slider-control');
      if (sliderControl) {
        sliderControl.after(quickButtons);
        
        // Thêm sự kiện cho các nút
        const buttons = quickButtons.querySelectorAll('.temp-btn');
        buttons.forEach(btn => {
          btn.addEventListener('click', function() {
            const temp = this.getAttribute('data-temp');
            acTempSlider.value = temp;
            handleTemperatureChange();
          });
        });
      }
    }
    
    // Khởi tạo ngay lập tức
    handleTemperatureChange();
  }
  
  // Gán sự kiện cho các thanh trượt khác
const fanSlider = document.getElementById('fanSpeedSlider');
const fanValue = document.getElementById('fanSpeedValue');

if (fanSlider && fanValue) {
  fanSlider.addEventListener('input', function() {
    const value = this.value;
    fanValue.textContent = value;
    
    // Chỉ cập nhật lên Firebase nếu quạt đang bật
    const fanStatus = document.getElementById('fanStatus');
    if (fanStatus && fanStatus.textContent.includes('Bật')) {
      firebase.database().ref('tocdoquat').set(parseInt(value))
        .then(() => console.log(`Đã cập nhật tốc độ quạt: ${value}`))
        .catch(error => console.error('Lỗi cập nhật tốc độ quạt:', error));
    }
    
    updatePowerConsumptionChart();
  });
}
  
const tvVolumeSlider = document.getElementById('tvVolumeSlider');
const tvVolumeValue = document.getElementById('tvVolumeValue');

if (tvVolumeSlider && tvVolumeValue) {
  tvVolumeSlider.addEventListener('input', function() {
    const value = this.value;
    tvVolumeValue.textContent = value + '%';
    
    // Chỉ cập nhật lên Firebase nếu TV đang bật
    const tvStatus = document.getElementById('tvStatus');
    if (tvStatus && tvStatus.textContent.includes('Bật')) {
      firebase.database().ref('amluong').set(parseInt(value))
        .then(() => console.log(`Đã cập nhật âm lượng TV: ${value}%`))
        .catch(error => console.error('Lỗi cập nhật âm lượng TV:', error));
    }
    
    updatePowerConsumptionChart();
  });
}
  
const lightSlider = document.getElementById('lightBrightnessSlider');
const lightValue = document.getElementById('lightBrightnessValue');

if (lightSlider && lightValue) {
  lightSlider.addEventListener('input', function() {
    const value = this.value;
    lightValue.textContent = value + '%';
    
    // Chỉ cập nhật lên Firebase nếu đèn đang bật
    const lightStatus = document.getElementById('lightStatus');
    if (lightStatus && lightStatus.textContent.includes('Bật')) {
      firebase.database().ref('dosang').set(parseInt(value))
        .then(() => console.log(`Đã cập nhật độ sáng: ${value}%`))
        .catch(error => console.error('Lỗi cập nhật độ sáng:', error));
    }
    
    updatePowerConsumptionChart();
  });
}
}

// Chức năng điều khiển chế độ
const mode1Button = document.getElementById('mode1');
const mode2Button = document.getElementById('mode2');
const exitButton = document.getElementById('exitMode');

// Hàm cập nhật trạng thái thiết bị
function updateDeviceStates(acTemp, lightLevel, fanSpeed, tvState) {
    // Cập nhật nhiệt độ điều hòa
    if (acTemp !== undefined) {
        console.log(`Đặt nhiệt độ điều hòa: ${acTemp}°C`);
        const acTempSlider = document.getElementById('acTempSlider');
        if (acTempSlider) {
            acTempSlider.value = acTemp;
            const acTempValue = document.getElementById('acTempValue');
            if (acTempValue) {
                acTempValue.textContent = acTemp + '°C';
            }
            // Cập nhật lên Firebase với key mới
            firebase.database().ref('nhietdomaylanh').set(acTemp);
        }
    }

    // Cập nhật độ sáng đèn
    if (lightLevel !== undefined) {
        console.log(`Đặt độ sáng đèn: ${lightLevel}%`);
        const lightSlider = document.getElementById('lightBrightnessSlider');
        if (lightSlider) {
            lightSlider.value = lightLevel;
            const lightValue = document.getElementById('lightBrightnessValue');
            if (lightValue) {
                lightValue.textContent = lightLevel + '%';
            }
            // Cập nhật lên Firebase với key mới
            firebase.database().ref('dosang').set(lightLevel);
        }
    }

    // Cập nhật tốc độ quạt
    if (fanSpeed !== undefined) {
        console.log(`Đặt tốc độ quạt: cấp ${fanSpeed}`);
        const fanSlider = document.getElementById('fanSpeedSlider');
        if (fanSlider) {
            fanSlider.value = fanSpeed;
            const fanValue = document.getElementById('fanSpeedValue');
            if (fanValue) {
                fanValue.textContent = fanSpeed;
            }
            // Cập nhật lên Firebase với key mới
            firebase.database().ref('tocdoquat').set(fanSpeed);
        }
    }

    // Cập nhật trạng thái TV
    if (tvState !== undefined) {
        console.log(`Đặt trạng thái TV: ${tvState ? 'BẬT' : 'TẮT'}`);
        const tvToggleBtn = document.getElementById('tvToggleBtn');
        if (tvToggleBtn) {
            if (tvState) {
                toggleDevice('tv', 'tvImage', 'tvStatus');
            }
            // Cập nhật lên Firebase với key mới
            firebase.database().ref('amluong').set(tvState);
        }
    }

    // Cập nhật biểu đồ công suất
    updatePowerConsumptionChart();
    // Kiểm tra cảnh báo nhiệt độ
    checkTemperatureWarning();
}

// Thêm hàm lắng nghe thay đổi từ Firebase

// Trong Mode 1 (đèn 50%)
if (lightToggleBtn) {
  // ... (phần bật đèn)
  const lightSlider = document.getElementById('lightBrightnessSlider');
  if (lightSlider) {
    lightSlider.value = 50;
    document.getElementById('lightBrightnessValue').textContent = '50%';
    firebase.database().ref('dosang').set(50);
  }
}

// Trong Mode 2 (đèn 100%)
if (lightToggleBtn) {
  // ... (phần bật đèn)
  const lightSlider = document.getElementById('lightBrightnessSlider');
  if (lightSlider) {
    lightSlider.value = 100;
    document.getElementById('lightBrightnessValue').textContent = '100%';
    firebase.database().ref('dosang').set(100);
  }
}

// Trong Exit Mode (tắt đèn)
if (lightToggleBtn) {
  // ... (phần tắt đèn)
  firebase.database().ref('dosang').set(0);
}
// Hàm cập nhật dữ liệu môi trường
function updateEnvironmentData() {
  // Lấy reference đến database
  const dbRef = firebase.database().ref();
  
  // Lắng nghe thay đổi dữ liệu
  dbRef.on('value', (snapshot) => {
    const data = snapshot.val();
    
    // Cập nhật nhiệt độ môi trường
    if (data.nhietdo !== undefined) {
      const envTemp = document.getElementById('environmentTemp');
      envTemp.textContent = `${data.nhietdo}°C`;
      envTemp.setAttribute('data-value', data.nhietdo);
    }
    if (data.doam !== undefined) {
      const envHumidity = document.getElementById('humidityValue');
      envHumidity.textContent = `${data.doam}%`;
      envHumidity.setAttribute('data-value', data.doam);
    }
    
    // Cập nhật dữ liệu phòng khách
    if (data.nhietdo1 !== undefined) {
      document.getElementById('living-temp').textContent = `${data.nhietdo1}°C`;
    }
    if (data.doam1 !== undefined) {
      document.getElementById('living-humidity').textContent = `${data.doam1}%`;
    }
    
    // Cập nhật dữ liệu phòng ngủ
    if (data.nhietdo2 !== undefined) {
      document.getElementById('bedroom-temp').textContent = `${data.nhietdo2}°C`;
    }
    if (data.doam2 !== undefined) {
      document.getElementById('bedroom-humidity').textContent = `${data.doam2}%`;
    }
    
    // Cập nhật dữ liệu phòng bếp
    if (data.nhietdo3 !== undefined) {
      document.getElementById('kitchen-temp').textContent = `${data.nhietdo3}°C`;
    }
    if (data.doam3 !== undefined) {
      document.getElementById('kitchen-humidity').textContent = `${data.doam3}%`;
    }
    
    // Cập nhật trạng thái dựa trên nhiệt độ
    updateRoomStatus('living-room', data.nhietdo1);
    updateRoomStatus('bedroom', data.nhietdo2);
    updateRoomStatus('kitchen', data.nhietdo3);
  });
}
function toggleDevice(deviceType, imageId, statusId) {
  const img = document.getElementById(imageId);
  const status = document.getElementById(statusId);
  
  if (!img || !status) return;
  
  const isOn = img.src.includes(`${deviceType}_on.gif`);
  const newState = !isOn;
  
  // Cập nhật giao diện
  if (newState) {
    img.src = `assets/img/${deviceType}_on.gif`;
    img.alt = `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} On`;
    status.textContent = 'Trạng thái: Bật';
    
    // Nếu là đèn, đặt độ sáng mặc định 70% khi bật
    if (deviceType === 'light') {
      const brightnessSlider = document.getElementById('lightBrightnessSlider');
      const brightnessValue = document.getElementById('lightBrightnessValue');
      if (brightnessSlider && brightnessValue) {
        brightnessSlider.value = 70;
        brightnessValue.textContent = '70%';
        // Cập nhật cả giá trị độ sáng lên Firebase
        firebase.database().ref('dosang').set(70);
      }
    }
  } else {
    img.src = `assets/img/${deviceType}_off.png`;
    img.alt = `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} Off`;
    status.textContent = 'Trạng thái: Tắt';
  }
  
  // Cập nhật trạng thái bật/tắt lên Firebase
  const firebaseKey = deviceType === 'ac' ? 'maylanh' : 
                     deviceType === 'fan' ? 'fan' : 
                     deviceType === 'tv' ? 'tv' : 
                     'light';
  
  firebase.database().ref(firebaseKey).set(newState ? 'on' : 'off')
    .then(() => console.log(`${deviceType} state updated to Firebase`))
    .catch(error => console.error(`Error updating ${deviceType} state:`, error));
  
  updatePowerConsumptionChart();
  
  // Xử lý đặc biệt cho điều hòa
  if (deviceType === 'ac' && newState) {
    setTimeout(() => {
      checkTemperatureWarning();
      forceShowTemperatureWarning();
    }, 200);
  }
}// Xử lý thanh trượt độ sáng đèn
const lightSlider = document.getElementById('lightBrightnessSlider');
const lightValue = document.getElementById('lightBrightnessValue');

if (lightSlider && lightValue) {
  // Hàm xử lý khi giá trị thay đổi
  const handleLightBrightnessChange = (value) => {
    lightValue.textContent = value + '%';
    
    // Kiểm tra nếu đèn đang bật thì mới cập nhật lên Firebase
    const lightStatus = document.getElementById('lightStatus');
    if (lightStatus && lightStatus.textContent.includes('Bật')) {
      firebase.database().ref('dosang').set(parseInt(value))
        .then(() => console.log(`Độ sáng đèn cập nhật lên Firebase: ${value}%`))
        .catch(error => console.error('Lỗi cập nhật độ sáng đèn:', error));
    }
    
    updatePowerConsumptionChart();
  };

  // Sự kiện khi kéo thanh trượt
  lightSlider.addEventListener('input', function() {
    handleLightBrightnessChange(this.value);
  });

  // Sự kiện khi thả thanh trượt
  lightSlider.addEventListener('change', function() {
    handleLightBrightnessChange(this.value);
  });
}function listenToDeviceChanges() {
  const dbRef = firebase.database().ref();
  
  // Lắng nghe thay đổi độ sáng đèn từ Firebase
  dbRef.child('dosang').on('value', (snapshot) => {
    const brightness = snapshot.val();
    if (brightness !== null) {
      console.log('Nhận giá trị độ sáng từ Firebase:', brightness + '%');
      
      const lightSlider = document.getElementById('lightBrightnessSlider');
      const lightValue = document.getElementById('lightBrightnessValue');
      const lightImage = document.getElementById('lightImage');
      const lightStatus = document.getElementById('lightStatus');
      
      if (lightSlider && lightValue) {
        // Cập nhật giá trị thanh trượt
        lightSlider.value = brightness;
        lightValue.textContent = brightness + '%';
        
        // Tự động bật đèn nếu độ sáng > 0 và đèn đang tắt
        if (brightness > 0 && lightImage && lightStatus && 
            lightStatus.textContent.includes('Tắt')) {
          lightImage.src = 'assets/img/light_on.gif';
          lightStatus.textContent = 'Trạng thái: Bật';
          firebase.database().ref('light').set('on');
        }
        
        // Tự động tắt đèn nếu độ sáng = 0 và đèn đang bật
        if (brightness == 0 && lightImage && lightStatus && 
            lightStatus.textContent.includes('Bật')) {
          lightImage.src = 'assets/img/light_off.png';
          lightStatus.textContent = 'Trạng thái: Tắt';
          firebase.database().ref('light').set('off');
        }
      }
      
      updatePowerConsumptionChart();
    }
  });
  
  // Giữ nguyên các lắng nghe khác...
  // (phần code hiện có của bạn cho các thiết bị khác)
}
function toggleDevice(deviceType, imageId, statusId) {
  const img = document.getElementById(imageId);
  const status = document.getElementById(statusId);
  
  if (!img || !status) return;
  
  const isOn = img.src.includes(`${deviceType}_on.gif`);
  const newState = !isOn;
  
  // Cập nhật giao diện
  if (newState) {
    img.src = `assets/img/${deviceType}_on.gif`;
    img.alt = `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} On`;
    status.textContent = 'Trạng thái: Bật';
    
    // Xử lý đặc biệt cho quạt
    if (deviceType === 'fan') {
      const speedSlider = document.getElementById('fanSpeedSlider');
      const speedValue = document.getElementById('fanSpeedValue');
      if (speedSlider && speedValue) {
        // Nếu đang tắt và bật lên, kiểm tra giá trị từ Firebase hoặc dùng mặc định 3
        firebase.database().ref('tocdoquat').once('value').then((snapshot) => {
          const savedSpeed = snapshot.val();
          const speedToSet = (savedSpeed !== null && savedSpeed > 0) ? savedSpeed : 3;
          
          speedSlider.value = speedToSet;
          speedValue.textContent = speedToSet;
          firebase.database().ref('tocdoquat').set(speedToSet);
        });
      }
    }
  } else {
    img.src = `assets/img/${deviceType}_off.png`;
    img.alt = `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} Off`;
    status.textContent = 'Trạng thái: Tắt';
  }
  
  // Cập nhật trạng thái bật/tắt lên Firebase
  const firebaseKey = deviceType === 'ac' ? 'maylanh' : 
                     deviceType === 'fan' ? 'fan' : 
                     deviceType === 'tv' ? 'tv' : 
                     'light';
  
  firebase.database().ref(firebaseKey).set(newState ? 'on' : 'off')
    .then(() => console.log(`${deviceType} trạng thái: ${newState ? 'BẬT' : 'TẮT'}`))
    .catch(error => console.error(`Lỗi cập nhật ${deviceType}:`, error));
  
  updatePowerConsumptionChart();
  
  // Xử lý đặc biệt cho điều hòa
  if (deviceType === 'ac' && newState) {
    setTimeout(() => {
      checkTemperatureWarning();
      forceShowTemperatureWarning();
    }, 200);
  }
}// Xử lý thanh trượt tốc độ quạt
const fanSlider = document.getElementById('fanSpeedSlider');
const fanValue = document.getElementById('fanSpeedValue');

if (fanSlider && fanValue) {
  // Hàm đồng bộ tốc độ quạt
  const syncFanSpeed = (value) => {
    const intValue = parseInt(value);
    fanValue.textContent = intValue;
    
    // Kiểm tra trạng thái quạt
    const fanStatus = document.getElementById('fanStatus');
    const isFanOn = fanStatus && fanStatus.textContent.includes('Bật');
    
    if (isFanOn) {
      // Cập nhật lên Firebase nếu quạt đang bật
      firebase.database().ref('tocdoquat').set(intValue)
        .then(() => console.log(`Đã cập nhật tốc độ quạt: ${intValue}`))
        .catch(error => console.error('Lỗi cập nhật tốc độ quạt:', error));
    } else if (intValue > 0) {
      // Nếu giá trị > 0 nhưng quạt đang tắt, tự động bật quạt
      toggleDevice('fan', 'fanImage', 'fanStatus');
    }
    
    updatePowerConsumptionChart();
  };

  // Sự kiện khi thay đổi thanh trượt
  fanSlider.addEventListener('input', (e) => syncFanSpeed(e.target.value));
  fanSlider.addEventListener('change', (e) => syncFanSpeed(e.target.value));
}
// Trong Mode 1 (quạt cấp 5)
if (fanToggleBtn) {
  // ... (phần bật quạt)
  const fanSlider = document.getElementById('fanSpeedSlider');
  if (fanSlider) {
    fanSlider.value = 5;
    document.getElementById('fanSpeedValue').textContent = '5';
    firebase.database().ref('tocdoquat').set(5);
  }
}

// Trong Mode 2 (quạt cấp 3)
if (fanToggleBtn) {
  // ... (phần bật quạt)
  const fanSlider = document.getElementById('fanSpeedSlider');
  if (fanSlider) {
    fanSlider.value = 3;
    document.getElementById('fanSpeedValue').textContent = '3';
    firebase.database().ref('tocdoquat').set(3);
  }
}

// Trong Exit Mode (tắt quạt)
if (fanToggleBtn) {
  // ... (phần tắt quạt)
  firebase.database().ref('tocdoquat').set(0);
}
function toggleDevice(deviceType, imageId, statusId) {
  const img = document.getElementById(imageId);
  const status = document.getElementById(statusId);
  
  if (!img || !status) return;
  
  const isOn = img.src.includes(`${deviceType}_on.gif`);
  const newState = !isOn;
  
  // Cập nhật giao diện
  if (newState) {
    img.src = `assets/img/${deviceType}_on.gif`;
    img.alt = `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} On`;
    status.textContent = 'Trạng thái: Bật';
    
    // Xử lý đặc biệt cho TV
    if (deviceType === 'tv') {
      const volumeSlider = document.getElementById('tvVolumeSlider');
      const volumeValue = document.getElementById('tvVolumeValue');
      if (volumeSlider && volumeValue) {
        // Nếu đang tắt và bật lên, kiểm tra giá trị từ Firebase hoặc dùng mặc định 50
        firebase.database().ref('amluong').once('value').then((snapshot) => {
          const savedVolume = snapshot.val();
          const volumeToSet = (savedVolume !== null && savedVolume >= 0) ? savedVolume : 50;
          
          volumeSlider.value = volumeToSet;
          volumeValue.textContent = volumeToSet + '%';
          firebase.database().ref('amluong').set(volumeToSet);
        });
      }
    }
  } else {
    img.src = `assets/img/${deviceType}_off.png`;
    img.alt = `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} Off`;
    status.textContent = 'Trạng thái: Tắt';
  }
  
  // Cập nhật trạng thái bật/tắt lên Firebase
  const firebaseKey = deviceType === 'ac' ? 'maylanh' : 
                     deviceType === 'fan' ? 'fan' : 
                     deviceType === 'tv' ? 'tv' : 
                     'light';
  
  firebase.database().ref(firebaseKey).set(newState ? 'on' : 'off')
    .then(() => console.log(`${deviceType} trạng thái: ${newState ? 'BẬT' : 'TẮT'}`))
    .catch(error => console.error(`Lỗi cập nhật ${deviceType}:`, error));
  
  updatePowerConsumptionChart();
  
  // Xử lý đặc biệt cho điều hòa
  if (deviceType === 'ac' && newState) {
    setTimeout(() => {
      checkTemperatureWarning();
      forceShowTemperatureWarning();
    }, 200);
  }
}
// Xử lý thanh trượt âm lượng TV
const tvVolumeSlider = document.getElementById('tvVolumeSlider');
const tvVolumeValue = document.getElementById('tvVolumeValue');

if (tvVolumeSlider && tvVolumeValue) {
  // Hàm đồng bộ âm lượng TV
  const syncTVVolume = (value) => {
    const intValue = parseInt(value);
    tvVolumeValue.textContent = intValue + '%';
    
    // Kiểm tra trạng thái TV
    const tvStatus = document.getElementById('tvStatus');
    const isTVOn = tvStatus && tvStatus.textContent.includes('Bật');
    
    if (isTVOn) {
      // Cập nhật lên Firebase nếu TV đang bật
      firebase.database().ref('amluong').set(intValue)
        .then(() => console.log(`Đã cập nhật âm lượng TV: ${intValue}%`))
        .catch(error => console.error('Lỗi cập nhật âm lượng TV:', error));
    } else if (intValue > 0) {
      // Nếu giá trị > 0 nhưng TV đang tắt, tự động bật TV
      toggleDevice('tv', 'tvImage', 'tvStatus');
    }
    
    updatePowerConsumptionChart();
  };

  // Sự kiện khi thay đổi thanh trượt
  tvVolumeSlider.addEventListener('input', (e) => syncTVVolume(e.target.value));
  tvVolumeSlider.addEventListener('change', (e) => syncTVVolume(e.target.value));
}
function listenToDeviceChanges() {
  const dbRef = firebase.database().ref();
  
  // Thiết bị máy lạnh
  dbRef.child('maylanh').on('value', (snapshot) => {
    const state = snapshot.val();
    if (state !== null) {
      console.log('Máy lạnh state:', state);
      const img = document.getElementById('acImage');
      const status = document.getElementById('acStatus');
      if (img && status) {
        img.src = state === 'on' ? 'assets/img/ac_on.gif' : 'assets/img/ac_off.png';
        status.textContent = `Trạng thái: ${state === 'on' ? 'Bật' : 'Tắt'}`;
        
        // Nếu bật máy lạnh thì hiển thị cảnh báo nhiệt độ
        if (state === 'on') {
          setTimeout(() => {
            checkTemperatureWarning();
            forceShowTemperatureWarning();
          }, 200);
        }
      }
    }
  });

  // Thiết bị đèn
  dbRef.child('light').on('value', (snapshot) => {
    const state = snapshot.val();
    if (state !== null) {
      console.log('Đèn state:', state);
      const img = document.getElementById('lightImage');
      const status = document.getElementById('lightStatus');
      if (img && status) {
        img.src = state === 'on' ? 'assets/img/light_on.gif' : 'assets/img/light_off.png';
        status.textContent = `Trạng thái: ${state === 'on' ? 'Bật' : 'Tắt'}`;
      }
    }
  });

  // Thiết bị TV
  dbRef.child('tv').on('value', (snapshot) => {
    const state = snapshot.val();
    if (state !== null) {
      console.log('TV state:', state);
      const img = document.getElementById('tvImage');
      const status = document.getElementById('tvStatus');
      if (img && status) {
        img.src = state === 'on' ? 'assets/img/tv_on.gif' : 'assets/img/tv_off.png';
        status.textContent = `Trạng thái: ${state === 'on' ? 'Bật' : 'Tắt'}`;
      }
    }
  });

  // Các giá trị khác (nhiệt độ, độ sáng, âm lượng...)
  dbRef.child('nhietdomaylanh').on('value', (snapshot) => {
    const temp = snapshot.val();
    if (temp !== null) {
      console.log('Nhiệt độ máy lạnh:', temp);
      const slider = document.getElementById('acTempSlider');
      const value = document.getElementById('acTempValue');
      if (slider && value) {
        slider.value = temp;
        value.textContent = temp + '°C';
        checkTemperatureWarning();
      }
    }
  });

  dbRef.child('dosang').on('value', (snapshot) => {
    const brightness = snapshot.val();
    if (brightness !== null) {
      console.log('Độ sáng đèn:', brightness);
      const slider = document.getElementById('lightBrightnessSlider');
      const value = document.getElementById('lightBrightnessValue');
      if (slider && value) {
        slider.value = brightness;
        value.textContent = brightness + '%';
      }
    }
  });

  dbRef.child('amluong').on('value', (snapshot) => {
    const volume = snapshot.val();
    if (volume !== null) {
      console.log('Âm lượng TV:', volume);
      const slider = document.getElementById('tvVolumeSlider');
      const value = document.getElementById('tvVolumeValue');
      if (slider && value) {
        slider.value = volume;
        value.textContent = volume + '%';
      }
    }
  });

  // Lắng nghe thay đổi nhiệt độ điều hòa
    dbRef.child('nhietdomaylanh').on('value', (snapshot) => {
        const temp = snapshot.val();
        if (temp !== null) {
            console.log('Nhiệt độ điều hòa thay đổi:', temp);
            updateDeviceStates(temp, undefined, undefined, undefined);
        }
    });

    // Lắng nghe thay đổi độ sáng đèn
    dbRef.child('dosang').on('value', (snapshot) => {
        const level = snapshot.val();
        if (level !== null) {
            console.log('Độ sáng đèn thay đổi:', level);
            updateDeviceStates(undefined, level, undefined, undefined);
        }
    });

    // Lắng nghe thay đổi tốc độ quạt
    dbRef.child('tocdoquat').on('value', (snapshot) => {
        const speed = snapshot.val();
        if (speed !== null) {
            console.log('Tốc độ quạt thay đổi:', speed);
            updateDeviceStates(undefined, undefined, speed, undefined);
        }
    });

    // Lắng nghe thay đổi âm lượng TV
    dbRef.child('amluong').on('value', (snapshot) => {
        const volume = snapshot.val();
        if (volume !== null) {
            console.log('Âm lượng TV thay đổi:', volume);
            const tvVolumeSlider = document.getElementById('tvVolumeSlider');
            if (tvVolumeSlider) {
                tvVolumeSlider.value = volume;
                const tvVolumeValue = document.getElementById('tvVolumeValue');
                if (tvVolumeValue) {
                    tvVolumeValue.textContent = volume + '%';
                }
            }
        }
    });

    // Lắng nghe trạng thái bật/tắt của các thiết bị với key mới
    const deviceMappings = {
        'maylanh': { deviceType: 'ac', imageId: 'acImage', statusId: 'acStatus' },
        'fan': { deviceType: 'fan', imageId: 'fanImage', statusId: 'fanStatus' },
        'tv': { deviceType: 'tv', imageId: 'tvImage', statusId: 'tvStatus' },
        'light': { deviceType: 'light', imageId: 'lightImage', statusId: 'lightStatus' }
    };

    Object.entries(deviceMappings).forEach(([firebaseKey, device]) => {
        dbRef.child(firebaseKey).on('value', (snapshot) => {
            const state = snapshot.val();
            if (state !== null) {
                console.log(`${firebaseKey} state changed:`, state);
                const img = document.getElementById(device.imageId);
                const status = document.getElementById(device.statusId);
                if (img && status) {
                    if (state === 'on') {
                        img.src = `assets/img/${device.deviceType}_on.gif`;
                        status.textContent = 'Trạng thái: Bật';
                    } else {
                        img.src = `assets/img/${device.deviceType}_off.png`;
                        status.textContent = 'Trạng thái: Tắt';
                    }
                }
            }
        });
    });
}
// Trong Mode 1 (TV âm lượng 50%)
if (tvToggleBtn) {
  // ... (phần bật TV)
  const tvVolumeSlider = document.getElementById('tvVolumeSlider');
  if (tvVolumeSlider) {
    tvVolumeSlider.value = 50;
    document.getElementById('tvVolumeValue').textContent = '50%';
    firebase.database().ref('amluong').set(50);
  }
}

// Trong Mode 2 (TV âm lượng 70%)
if (tvToggleBtn) {
  // ... (phần bật TV)
  const tvVolumeSlider = document.getElementById('tvVolumeSlider');
  if (tvVolumeSlider) {
    tvVolumeSlider.value = 70;
    document.getElementById('tvVolumeValue').textContent = '70%';
    firebase.database().ref('amluong').set(70);
  }
}

// Trong Exit Mode (tắt TV)
if (tvToggleBtn) {
  // ... (phần tắt TV)
  firebase.database().ref('amluong').set(0);
}

// Hàm cập nhật trạng thái phòng dựa trên nhiệt độ
function updateRoomStatus(roomId, temperature) {
  const statusElement = document.getElementById(`${roomId}-status`);
  if (!statusElement) return;
  
  if (temperature > 35) {
    statusElement.textContent = 'Quá nóng';
    statusElement.style.color = '#f44336';
  } else if (temperature > 30) {
    statusElement.textContent = 'Nóng';
    statusElement.style.color = '#ff9800';
  } else if (temperature < 15) {
    statusElement.textContent = 'Quá lạnh';
    statusElement.style.color = '#2196f3';
  } else if (temperature < 20) {
    statusElement.textContent = 'Lạnh';
    statusElement.style.color = '#03a9f4';
  } else {
    statusElement.textContent = 'Bình thường';
    statusElement.style.color = '#4CAF50';
  }
}
