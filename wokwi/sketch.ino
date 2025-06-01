#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// WiFi credentials
#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""

// Khai báo 4 chân DHT
#define DHTPIN1 15  // Cảm biến có sẵn
#define DHTPIN2 4
#define DHTPIN3 5
#define DHTPIN4 18

#define DHTTYPE DHT22

// Tạo 4 đối tượng DHT
DHT dht1(DHTPIN1, DHTTYPE);
DHT dht2(DHTPIN2, DHTTYPE);
DHT dht3(DHTPIN3, DHTTYPE);
DHT dht4(DHTPIN4, DHTTYPE);

// Địa chỉ Firebase
const char* firebaseHost = "https://ttiot-5092c-default-rtdb.firebaseio.com/";

// Tên đường dẫn Firebase cho từng cảm biến
const char* firebasePaths[] = {
  "/nhietdo1.json", "/doam1.json",
  "/nhietdo2.json", "/doam2.json",
  "/nhietdo3.json", "/doam3.json",
  "/nhietdo.json", "/doam.json"
};

void setup() {
  Serial.begin(115200);
  dht1.begin();
  dht2.begin();
  dht3.begin();
  dht4.begin();

  // Kết nối WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Dang ket noi WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nDa ket noi WiFi!");
}

void sendToFirebase(String path, float value) {
  HTTPClient http;
  String fullUrl = String(firebaseHost) + path;
  http.begin(fullUrl);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.PUT(String(value));

  if (httpResponseCode > 0) {
    Serial.printf("Gui %s: %.2f thanh cong\n", path.c_str(), value);
  } else {
    Serial.printf("Loi gui %s: %s\n", path.c_str(), http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}

void loop() {
  // Đọc dữ liệu từng cảm biến
  float temps[] = {
    dht1.readTemperature(), dht2.readTemperature(),
    dht3.readTemperature(), dht4.readTemperature()
  };

  float humids[] = {
    dht1.readHumidity(), dht2.readHumidity(),
    dht3.readHumidity(), dht4.readHumidity()
  };

  // Kiểm tra lỗi
  for (int i = 0; i < 4; i++) {
    if (isnan(temps[i]) || isnan(humids[i])) {
      Serial.printf("Loi doc cam bien %d\n", i + 1);
      return;
    }
  }

  // In ra màn hình
  for (int i = 0; i < 4; i++) {
    Serial.printf("Cam bien %d - Nhiet do: %.2f *C, Do am: %.2f %%\n", i + 1, temps[i], humids[i]);
  }

  // Gửi lên Firebase
  if (WiFi.status() == WL_CONNECTED) {
    for (int i = 0; i < 4; i++) {
      sendToFirebase(firebasePaths[i * 2], temps[i]);
      sendToFirebase(firebasePaths[i * 2 + 1], humids[i]);
    }
  }

  delay(5000);  // Đợi 5 giây
}
