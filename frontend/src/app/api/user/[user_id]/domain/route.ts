import { NextRequest, NextResponse } from 'next/server';

// Define the backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10002';

export async function POST(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const user_id = params.user_id;
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/api/${user_id}/domain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding domain:', error);
    return NextResponse.json(
      { error: 'Failed to add domain' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const user_id = params.user_id;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/${user_id}/domains`, {
      method: 'GET',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domains from backend' },
      { status: 500 }
    );
  }
} 