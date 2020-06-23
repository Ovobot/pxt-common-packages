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

#define RTC_TYPE_DS1339 0x68

// defined in rtchw.cpp
namespace pxt {
  codal::I2C *getRtcI2C();
  uint8_t rtc_bcd[7];


}

namespace rtcModules{
  //%
  void requestUpdate(){
    auto i2c = getRtcI2C();
    if (!i2c) return;
    i2c->readRegister(RTC_TYPE_DS1339 << 1, REG_DS1339_SECONDS, rtc_bcd, 7);
  }

  //%
  int getSeconds() {
    uint8_t res = rtc_bcd[0];
    uint8_t data = (res & 0x7f);
    uint8_t seconds = (data>>4)*10 + (data&0x0f);
    return seconds;
  }

  //%
  int getMinutes() {
    uint8_t res = rtc_bcd[1];
    uint8_t data = (res & 0x7f);
    uint8_t minutes = (data>>4)*10 + (data&0x0f);
    return minutes;
  }

  //%
  int getHours() {
    uint8_t minutes = 0;
    uint8_t res = rtc_bcd[2];
    uint8_t data = (res & 0x7f);
    uint8_t flag12 =  data >> 6;
    if(flag12){
        uint8_t getAMPM = (data &= (1<<5));
        uint8_t data2 = (data & 0x1f);
        minutes = (data2>>4)*10 + (data&0x0f);
    } else {
        uint8_t data2 = (data & 0x3f);
        minutes = (data2>>5)*20 + ((data & 0x1f)>>4)*10 + (data2&0x0f);
    }
    return minutes;
  }

  //%
  int getDay() {
    uint8_t day = rtc_bcd[3];
    return day;
  }

  //%
  int getDate() {
    uint8_t res = rtc_bcd[4];
    uint8_t data = (res & 0x3f);
    uint8_t date = (data>>4)*10 + (data&0x0f);
    return date;
  }

  //%
  int getMonth() {
    uint8_t res = rtc_bcd[5];
    uint8_t data = (res & 0x1f);
    uint8_t month = (data>>4)*10 + (data&0x0f);
    return month;
  }

  //%
  int getFullYear() {
    uint8_t res = rtc_bcd[6];
    uint16_t year = 2000 + (res >> 4) * 10 + (res & 0x0f);
    return year;
  }
}

