import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();
const DEV_ORIGIN_PORTS = new Set(['4173', '5173']);

const parseOrigin = (value) => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const configuredClientOrigin = parseOrigin(env.clientUrl);

const isLoopbackHost = (hostname) => ['127.0.0.1', '::1', 'localhost'].includes(hostname);

const isAllowedDevOrigin = (origin) => {
  const parsedOrigin = parseOrigin(origin);
  if (!parsedOrigin || parsedOrigin.protocol !== 'http:') {
    return false;
  }

  if (isLoopbackHost(parsedOrigin.hostname)) {
    return true;
  }

  return DEV_ORIGIN_PORTS.has(parsedOrigin.port);
};

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (origin === env.clientUrl || origin === configuredClientOrigin?.origin || isAllowedDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'credithub-server',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
