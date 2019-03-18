import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const { spawn, exec } = require('child_process');
import ledManager from './ledManager';
import { setLights } from './PRMan2';

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const router = express.Router();

router.get('/setBrightness', (req, res) => {
  try {
    const { quantity } = req.query;

    ledManager.setBrightness(parseInt(quantity, 10) || 255);

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

router.get('/shutdown', (req, res) => {
  try {
    exec('sh /home/pi/Desktop/shutdown.sh');

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

router.get('/updateCode', (req, res) => {
  try {
    // const commands = [
    //   () => spawn('cd', ['/home/pi/Desktop/PRLed2']),
    //   () => spawn('git', ['reset', '--hard', 'HEAD']),
    //   () => spawn('git', ['pull']),
    //   () => spawn('cd', ['/home/pi/Desktop/PRLed2/PRControll']),
    //   () => spawn('sudo', ['yarn', 'build']),
    //   () => spawn('reboot', []),
    // ];
    // const runCommand = (command, index = 0, text = '') => {
    //   command.stdout.on('data', (data) => {
    //     const message = `${text}\n${data}`;
    //     if (commands.length < index + 1) {
    //       runCommand(commands[index + 1](), index + 1, text);
    //     }
    //
    //     return res.json({ status: 'success', message });
    //   });
    //
    //   command.stderr.on('data', (data) => {
    //     const message = `${text}\n${data}`;
    //     return res.json({ status: 'error', message });
    //   });
    // }
    // runCommand(commands[0]());
    exec('sh /home/pi/Desktop/updateCode.sh');

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

router.get('/blink', (req, res) => {
  try {
    const { color, times = 3, fixed } = req.query;

    ledManager.blink(new Array(90).fill(color), times, fixed === 'true');

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

router.all('/prman', (req, res) => {
  try {
    setLights();
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

app.use('/', router);

export default app;
