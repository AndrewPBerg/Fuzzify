import { NextResponse } from 'next/server';

// Mock user ID for demonstration purposes
// In a real app, this would come from authentication
const MOCK_USER_ID = "user123";

export async function GET(request: Request) {
  try {
    // Get domain root from query parameters
    const { searchParams } = new URL(request.url);
    const domainRoot = searchParams.get('domain');
    
    if (!domainRoot) {
      return NextResponse.json(
        { error: 'Domain root is required' },
        { status: 400 }
      );
    }

    // Fetch domain permutations from backend
    const response = await fetch(`http://localhost:10002/${MOCK_USER_ID}/${domainRoot}/permutations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching domain permutations: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching domain permutations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domain permutations' },
      { status: 500 }
    );
  }
} 