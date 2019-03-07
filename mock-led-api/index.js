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
    const isAllNull = colors.filter(color => color !== null).length === 0;
    if (colors.length > 0 && !isAllNull) {
      fetch(opt);
    }
  },
};

module.exports = LedAPI;
