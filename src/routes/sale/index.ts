import { Response, Request } from 'express';

export async function sale(req: Request, res: Response) {
    const body = req.body;
    console.log(body);
    res.status(202).send();
}
