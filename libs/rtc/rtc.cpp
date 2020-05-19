#include "pxt.h"
#include "I2C.h"

// DS1339 Register Address
#define REG_DS1339_SECONDS          0x00
#define REG_DS1339_MINUTES          0x01
#define REG_DS1339_HOURS            0x02
#define REG_DS1339_DAY              0x03
#define REG_DS1339_DATE             0x04
#define REG_DS1339_MONTH            0x05
#define REG_DS1339_YEAR             0x06
#define REG_DS1339_ALARM1_SECONDS   0x07
#define REG_DS1339_ALARM1_MINUTES   0x08
#define REG_DS1339_ALARM1_HOURS     0x09
#define REG_DS1339_ALARM1_DAYDATE   0x0A
#define REG_DS1339_ALARM2_MINUTES   0x0B
#define REG_DS1339_ALARM2_HOURS     0x0C
#define REG_DS1339_ALARM2_DAYDATE   0x0D
#define REG_DS1339_CONTROL          0x0E
#define REG_DS1339_STATUS           0x0F
#define REG_DS1339_TRICKLE_CHARGER  0x10

#define DS1339_ALARM1_ADDR 0x07
#define DS1339_ALARM2_ADDR 0x0B

namespace pxt {

class WRtc {
  public:
    WRtc() //
    {
        
        auto sda = LOOKUP_PIN(SDA);
        auto scl = LOOKUP_PIN(SCL);
        codal::I2C* i2c = pxt::getI2C(sda, scl);
        if (NULL == i2c) {
            DMESG("rtc: no i2c available");
            return;
        }
        int accDetect = detectRTC(i2c);
    }
  private:
    int detectRTC(codal::I2C* i2c){
		uint8_t data;
		int result;

		result = i2c->readRegister(RTC_TYPE_DS1339, REG_DS1339_SECONDS, &data, 1);
        if(result == 0) {
            DMESG("rtc: seconds %d", data);
        }
		// if (result ==0)
		// 	return ACCELEROMETER_TYPE_LIS3DH;
		// result = i2c->readRegister(ACCELEROMETER_TYPE_LIS3DH_ALT, LIS3DH_WHOAMI, &data, 1);
		// if (result ==0)
		// 	return ACCELEROMETER_TYPE_LIS3DH_ALT;
			

		return -1;
	}
};
SINGLETON_IF_PIN(WRtc, SCL);

}

// /**
//  * Read the light level applied to the LED screen in a range from 0 (dark) to 255 (bright).
//  */
// //% help=input/light-level
// //% blockId=device_get_rtc_seconds block="rtc seconds"
// //% parts="rtc"
// //% weight=30 blockGap=8
// int rtcSeconds() {
//     auto wrtc = getWRtc();
//     if (NULL == wrtc) return -1;
//     auto sensor = wlight->sensor;
//     // 0...1023
//     int value = sensor.getValue();
//     return value / 4;
// }
