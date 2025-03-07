import { NextResponse } from 'next/server';

// Mock user ID for demonstration purposes
// In a real app, this would come from authentication
const MOCK_USER_ID = "user123";

export async function GET() {
  try {
    // Fetch all domain roots for the user
    const response = await fetch(`http://localhost:10002/${MOCK_USER_ID}/domains`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching domain roots: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching domain roots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domain roots' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { domainRoot } = await request.json();
    
    if (!domainRoot) {
      return NextResponse.json(
        { error: 'Domain root is required' },
        { status: 400 }
      );
    }

    // Add domain root to backend
    const response = await fetch(`http://localhost:10002/${MOCK_USER_ID}/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domainRoot }),
    });

    if (!response.ok) {
      throw new Error(`Error adding domain root: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding domain root:', error);
    return NextResponse.json(
      { error: 'Failed to add domain root' },
      { status: 500 }
    );
  }
} 