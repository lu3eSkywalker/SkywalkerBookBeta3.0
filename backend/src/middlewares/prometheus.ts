import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';
import { Gauge, Histogram } from "prom-client";


const counter = new client.Counter({
    name: "http_number_of_requests",
    help: "Number of HTTP requests made",
    labelNames: ['method', 'route', 'status_code'],
});

export function requestCountMiddleware(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
        counter.inc({
            method: req.method,
            route: req.path,
            status_code: res.statusCode
        });
    });
    next();
}

const histogram = new Histogram({
    name: "request_time",
    help: "Time it took for a request to be handled",
    labelNames: ['route'],
    buckets: [0.1, 1, 5, 10, 100, 1000, 3000]
});

export function requestDurationMiddleware(route: any) {
    return function requestDuration(req: Request, res: Response, next: NextFunction) {
        const startTime = Date.now();
        res.on("finish", () => {
            const endTime = Date.now();
            histogram.observe({ route }, ( endTime - startTime ) / 1000);
        });
    
        next();
    }
}

export const activeUserGauge = new Gauge({
    name: 'active_users',
    help: 'Number of active users',
});

activeUserGauge.set(0);