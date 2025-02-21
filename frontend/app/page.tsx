'use client';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
interface DataFetcherProps {
    path: string;
}

function DataFetcher({ path }: DataFetcherProps) {
    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ['apiData', path], // Include path in queryKey to handle different routes
        queryFn: () => fetchData(path),
        staleTime: 5000
    });

    // Display loading, error, or data from API
    return (
        <div style={{ 
            padding: '20px', 
            textAlign: 'center',
            maxWidth: '100%',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <h1 style={{ fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 'bold', marginBottom: '20px' }}>
                API Data for {path}
            </h1>
            {isLoading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
            {data && (
                <div style={{ 
                    padding: '10px', 
                    background: '#f0f0f0', 
                    borderRadius: '8px', 
                    display: 'inline-block', 
                    textAlign: 'left',
                    maxWidth: '100%',
                    overflow: 'auto'
                }}>
                    <pre style={{ fontSize: '14px', margin: 0 }}>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
            <button 
                onClick={() => refetch()} 
                style={{ 
                    marginTop: '20px', 
                    padding: '10px 15px', 
                    backgroundColor: '#0070f3', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer',
                    width: 'fit-content'
                }}
            >
                Refresh Data
            </button>
        </div>
    );
}

export default function Page() {
    // Render DataFetcher component with different API endpoints
    return (
        <QueryClientProvider client={queryClient}>
            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '20px'
            }}>
                <h2>Different API Endpoints</h2>
                <h2>Talking to: {baseUrl}</h2>
                <div style={{ 
                    display: 'flex', 
                    gap: '20px', 
                    justifyContent: 'center', 
                    marginBottom: '20px',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'stretch'
                }}>
                    <DataFetcher path="/api/data" />
                    <DataFetcher path="/db-test" />
                    <DataFetcher path="/test-pubsub" />
                </div>
            </div>
        </QueryClientProvider>
    );
}
