import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Express } from 'express';

export const initSentry = (app: Express) => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      new ProfilingIntegration(),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: 1.0,
    beforeSend(event) {
      // Sanitize sensitive data
      if (event.request?.cookies) {
        event.request.cookies = '[Filtered]';
      }
      if (event.request?.headers?.authorization) {
        event.request.headers.authorization = '[Filtered]';
      }
      return event;
    },
  });

  // RequestHandler creates a separate execution context using domains
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  // Error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());

  // Optional fallthrough error handler
  app.use((err: any, req: any, res: any, next: any) => {
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? 'An error occurred'
      : err.message;

    res.status(status).json({
      error: message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  });
};
