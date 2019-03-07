const fetch = require('axios');

const LedAPI = {
  init() {},
  setBrightness() {},
  render(colors) {
    const opt = {
      url: `http://localhost:3000/leds/1`,
      method: 'PUT',
      data: { colors }
    };
    fetch(opt);
  },
};

module.exports = LedAPI;
