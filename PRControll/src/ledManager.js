import ledLib from 'rpi-ws281x-native';

let lastStrip = [];

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const resetDiff = (newStrip, oldStrip) => (
  newStrip.map((led, n) => (led !== oldStrip[n] ? 0x000000 : newStrip[n]))
);

const blink = async (leds, blinkTimes = 3, fix = false) => {
  for (let i = 0; i < blinkTimes; i++) {
    ledLib.render(resetDiff(leds, lastStrip));
    await sleep(200);

    ledLib.render(leds);
    await sleep(200);
  }

  if (!fix) {
    ledLib.render(lastStrip);
  }
};

const blinkAndFix = async (leds, blinkTimes = 3) => {
  await blink(leds, blinkTimes, true);

  lastStrip = leds;
};

export default {
  ...ledLib,
  blinkAndFix,
  blink,
};
