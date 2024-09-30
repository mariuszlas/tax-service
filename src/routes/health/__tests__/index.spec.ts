import { Response } from 'express';
import { health } from '..';

/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('health', () => {
    it('should respond with success', async () => {
        const mockJson = jest.fn();
        const mockResponse = { json: mockJson } as any as Response;

        await health(undefined, mockResponse);

        expect(mockJson).toHaveBeenCalledTimes(1);
    });
});
