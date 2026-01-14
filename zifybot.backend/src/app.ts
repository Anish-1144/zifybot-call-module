import express, { Express, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {setupSwagger} from './swagger'

const app: Express = express();

app.use(cors({
  origin: [

  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

app.use(express.static("public"));
app.use(cookieParser());

app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });

    next();
});


app.get('/health', (req, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running'
    });
}
);

// Auth routes
import authRoutes from './routes/auth.routes';
app.use('/api/auth', authRoutes);

// Admin routes
import adminRoutes from './routes/admin.routes';
app.use('/api/admin', adminRoutes);

// Telnyx routes (AI calling agent)
import telnyxRoutes from './routes/telnyx.routes';
app.use('/api/telnyx', telnyxRoutes);
// Webhook endpoint (no /api/telnyx prefix for webhook)
app.use('/api/webhook', telnyxRoutes);

export default app
