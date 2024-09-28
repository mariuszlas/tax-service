import { Response } from 'express';

export async function health(_, res: Response) {
    res.json({ status: 'OK' });
}
