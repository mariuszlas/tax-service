import { Response, Request } from 'express';

export async function taxPosition(req: Request, res: Response) {
    const query = req.query;
    console.log(query);
    res.status(200).json({ date: '2024-02-22T17:29:39Z', taxPosition: 234 });
}
