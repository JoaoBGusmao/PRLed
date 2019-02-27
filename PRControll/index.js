import 'dotenv/config';
import ledBoot, { setLights } from './src/PRMan';
import server from './src/server';

const boot = () => {
  console.log('PRLed Application started');

  ledBoot();
  setLights();

  server.listen(80, () => {
    console.log('API is running at port: 80');
  });
};

boot();
