import { NextResponse } from 'next/server';

// Define the backend API URL - adjust this based on your environment setup
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10002';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users from backend' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Ensure we have a user_id in the response
    if (!data.user_id) {
      throw new Error('Backend response missing user_id');
    }
    
    return NextResponse.json({
      user_id: data.user_id,
      username: body.username,
      message: data.message || 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
} 