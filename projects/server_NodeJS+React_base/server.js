import express from 'express';
import {fileURLToPath} from 'url';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

//Routes import
import mainRoutes from './routes/mainRoutes.js';
import ersteRoutes from './routes/ersteRoutes.js';

// Input route here - it'll be added in 'app.use()' lower
const usingRoutes = [
  {
    path: '/erste',
    route: ersteRoutes
  },
  {
    path: '/',
    route: mainRoutes
  },
];

const app = express();
dotenv.config(); //Loads environment variables from .env
const PORT = process.env.PORT || 12354;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';

// ======================= 🛠 Development area (not implemented yet)========================
/*
if (isDev) {
    console.log('Start dev mode...');
    import('webpack').then(({ default: webpack }) => {
        import('webpack-dev-middleware').then(({ default: webpackDevMiddleware }) => {
            import('webpack-hot-middleware').then(({ default: webpackHotMiddleware }) => {
                import('./webpack.config.js').then(({ default: webpackConfig }) => {
                    const compiler = webpack(webpackConfig);
                    // Webpack middleware for work with bundle requests
                    app.use(
                        webpackDevMiddleware(compiler, {
                            publicPath: webpackConfig.output.publicPath,
                            stats: 'minimal',
                            writeToDisk: true
                        })
                    );
                    // Hot Module Replacement (HMR)
                    app.use(webpackHotMiddleware(compiler));

                    console.log('✅ Webpack Dev Middleware is active');
                });
            });
        });
    });
} else {
  app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',  // cache lifecycle - 1 day
    etag: true      // ETag checking for cache
}));
}
/* */
// =======================================================================================

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',  // cache lifecycle - 1 day
  etag: true      // ETag checking for cache
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// basic protection
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], // local only
      scriptSrc: ["'self'"], // local and trusted only
    },
  },
})); 
app.use(helmet.frameguard({ action: 'deny' })); // Denying attachment for page in iframe

// limiter for DDoS preventing
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
}));

app.use(cors({
  //origin: 'https://allowed-domain.com', // need to set domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression()); // requests compression

app.use(morgan('combined')); // requests logging

// Routes input from usingRoutes
usingRoutes.forEach(r => app.use(r.path, r.route));

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof SyntaxError) {
    return res.status(400).send({ error: 'Bad request' });
  }
  if (err.name === 'ValidationError') {
    return res.status(422).send({ error: 'Validation failed' });
  }
  res.status(500).send({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
