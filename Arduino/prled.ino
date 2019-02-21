#include <Adafruit_NeoPixel.h>
#include "WS2812_Definitions.h"

#define PIN 4
#define LED_COUNT 30
#define STRIP_COUNT 3

Adafruit_NeoPixel strip = Adafruit_NeoPixel(LED_COUNT * 3, PIN, NEO_GRB + NEO_KHZ800);

void setup()
{
  Serial.begin(9600);
  strip.begin();

  int colors[] = { 0, 1, 2, 5, 6 };
  setColors(colors);
//
//  setColor(0, 0, 0);
//  setColor(1, 0, 0);
//  setColor(2, 0, 0);

//  setColor(0, 0xFF0000, 3);
//  setColor(1, 0x00FF00, 3);
//  setColor(2, 0x0000FF, 3);
}

void loop(){
  
}

int getStripInit(int stripNumber) {
  return LED_COUNT * stripNumber;
}

void setColors(int colors[]) {
  Serial.println(sizeof(colors)/sizeof(int));
  for (int i = 0; i <= sizeof(colors)/sizeof(int); i++) {
    Serial.println("ASD");
  }
}

void setColor(int stripNumber, long color, int blink) {
  int stripInit = getStripInit(stripNumber);

  for (int j = 0; j < blink + 1; j++) {
    for (int i = 0; i < LED_COUNT; i++) {
      strip.setPixelColor(stripInit + i, color);
    }

    Serial.println(color);
    strip.show();

    if (blink > 0) {
      setColor(stripNumber, 0, 0);
      delay(1000);
    }
  }
}
