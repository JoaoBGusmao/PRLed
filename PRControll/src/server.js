import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import ledManager from './ledManager';
import { setLights } from './PRMan';

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
