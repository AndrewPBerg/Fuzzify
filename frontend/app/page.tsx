'use client';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const queryClient = new QueryClient();

const fetchData = async () => {
    const response = await fetch("http://127.0.0.1:5000/api/data");
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
};

function DataFetcher() {
    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ['apiData'],
        queryFn: fetchData,
        staleTime: 5000
    });

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>API Data</h1>
            {isLoading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
            {data && (
                <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '8px', display: 'inline-block', textAlign: 'left' }}>
                    <pre style={{ fontSize: '14px' }}>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
            <button onClick={() => refetch()} style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Refresh Data</button>
        </div>
    );
}

export default function Page() {
    return (
        <QueryClientProvider client={queryClient}>
            <DataFetcher />
        </QueryClientProvider>
    );
}
