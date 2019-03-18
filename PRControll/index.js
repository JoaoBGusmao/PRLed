import 'dotenv/config';
import ledBoot, { setLights } from './src/PRMan2';
import server from './src/server';

const boot = () => {
  console.log('PRLed Application started');

  ledBoot();

  server.listen(80, () => {
    console.log('API is running at port: 80');
    setLights().then(() => {
      console.log('Called the PR Man');
    });
  });
};

boot();
