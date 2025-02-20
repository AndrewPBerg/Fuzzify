'use client';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();
// const baseUrl = process.env.NEXT_PUBLIC_API_URL; // TODO env not working.
// const baseUrl = process.env.NEXT_PUBLIC_API_URL;
const baseUrl = "http://localhost:10001";

// Create a reusable fetch function that takes a path parameter
const fetchData = async (path: string) => {
    // Log the URL being used (for debugging)
    console.log('Using API URL:', baseUrl);
    
    if (!baseUrl) {
        throw new Error('API URL not configured');
    }

    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) {
        throw new Error(`Network response was not ok with message: (${response.status}) \n with url ${baseUrl}${path}`);
    }
    return response.json();
};

// Component that fetches data from the API
function DataFetcher({ path }: { path: string }) {
    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ['apiData', path], // Include path in queryKey to handle different routes
        queryFn: () => fetchData(path),
        staleTime: 5000
    });

    // Display loading, error, or data from API
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                API Data for {path}
            </h1>
            {isLoading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
            {data && (
                <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '8px', display: 'inline-block', textAlign: 'left' }}>
                    <pre style={{ fontSize: '14px' }}>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
            <button onClick={() => refetch()} style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Refresh Data
            </button>
        </div>
    );
}

export default function Page() {
    // Render DataFetcher component with different API endpoints
    return (
        <QueryClientProvider client={queryClient}>
            <div>
                <h2>Different API Endpoints </h2>
                <h2>Talking to: {baseUrl}</h2>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' }}>
                    <DataFetcher path="/api/data" />
                    <DataFetcher path="/db-test" />
                    <DataFetcher path="/test-pubsub" />
                </div>
            </div>
        </QueryClientProvider>
    );
}
