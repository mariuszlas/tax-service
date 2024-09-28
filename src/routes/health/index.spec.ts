import { Response } from 'express';
import { health } from '.';

describe('health', () => {
    it('should respond with success', () => {
        const mockJson = jest.fn();
        const mockResponse = { json: mockJson } as any as Response;

        health(undefined, mockResponse);

        expect(mockJson).toHaveBeenCalledTimes(1);
    });
});
