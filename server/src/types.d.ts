declare module 'express' {
    export interface Request {
        user?: {
            id: string;
            role: string;
        };
    }
}

declare module '@sentry/node';
declare module '@sentry/profiling-node';
declare module '@faker-js/faker/locale/fr';

interface DashboardWidget {
    id: string;
    type: string;
    data: any;
}
