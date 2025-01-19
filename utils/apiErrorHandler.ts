export class APIError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export function handleAPIError(error: unknown): APIError {
    if (error instanceof APIError) {
        return error;
    }

    if (error instanceof Error) {
        return new APIError(error.message);
    }

    return new APIError('An unexpected error occurred');
}

export async function fetchWithErrorHandling<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new APIError(
                `Request failed with status ${response.status}`,
                response.status
            );
        }

        return await response.json();
    } catch (error) {
        throw handleAPIError(error);
    }
} 