import { NextResponse } from 'next/server';

// Mock user ID for demonstration purposes
// In a real app, this would come from authentication
const MOCK_USER_ID = "user123";

export async function GET() {
  try {
    // Fetch user settings from backend
    const response = await fetch(`http://localhost:10002/user/${MOCK_USER_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching user settings: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const settings = await request.json();
    
    // Send settings to backend
    const response = await fetch(`http://localhost:10002/user/${MOCK_USER_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Error saving user settings: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving user settings:', error);
    return NextResponse.json(
      { error: 'Failed to save user settings' },
      { status: 500 }
    );
  }
} 