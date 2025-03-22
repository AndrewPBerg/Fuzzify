import { NextRequest, NextResponse } from 'next/server';

// Define the backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10002';

export async function POST(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const user_id = params.user_id;
  
  try {
    console.log(`[API] Processing domain POST for user_id: ${user_id}`);
    
    // Safely parse the request body
    let body;
    try {
      const text = await request.text();
      console.log('[API] Raw request body:', text);
      body = JSON.parse(text);
    } catch (e) {
      console.error('[API] JSON parse error:', e);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    console.log('[API] Parsed request body:', body);
    
    // Validate required fields
    if (!body.domain_name) {
      return NextResponse.json(
        { error: 'Missing required field: domain_name' },
        { status: 400 }
      );
    }
    
    // Use the correct URL format for the backend API
    const backendUrl = `${API_BASE_URL}/api/${user_id}/domain`;
    console.log(`[API] Making request to backend URL: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
    });
    
    console.log(`[API] Backend response status: ${response.status}`);
    
    // Get the raw response text first for debugging
    const responseText = await response.text();
    console.log(`[API] Backend raw response: ${responseText}`);
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[API] Error parsing backend response as JSON:', e);
      return NextResponse.json(
        { error: 'Invalid JSON response from backend', raw: responseText },
        { status: 502 }
      );
    }
    
    if (!response.ok) {
      console.error('[API] Backend error response:', { 
        status: response.status, 
        statusText: response.statusText,
        data 
      });
      return NextResponse.json(
        { error: data.error || `Backend responded with status: ${response.status} (${response.statusText})` },
        { status: response.status }
      );
    }
    
    console.log('[API] Backend success response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error adding domain:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add domain' },
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
    console.log(`[API] Processing domains GET for user_id: ${user_id}`);
    
    // Use the correct endpoint for the backend API
    const backendUrl = `${API_BASE_URL}/api/${user_id}/domain`;
    console.log(`[API] Making request to backend URL: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store',
    });
    
    console.log(`[API] Backend response status: ${response.status}`);
    
    // Get the raw response text first for debugging
    const responseText = await response.text();
    console.log(`[API] Backend raw response: ${responseText}`);
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[API] Error parsing backend response as JSON:', e);
      return NextResponse.json(
        { error: 'Invalid JSON response from backend', raw: responseText },
        { status: 502 }
      );
    }
    
    if (!response.ok) {
      console.error('[API] Backend error response:', { 
        status: response.status, 
        statusText: response.statusText,
        data 
      });
      return NextResponse.json(
        { error: data.error || `Backend responded with status: ${response.status} (${response.statusText})` },
        { status: response.status }
      );
    }
    
    console.log('[API] Backend success response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error fetching domains:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch domains from backend' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const user_id = params.user_id;
  
  try {
    console.log(`[API] Processing domain DELETE for user_id: ${user_id}`);
    
    // Safely parse the request body
    let body;
    try {
      const text = await request.text();
      console.log('[API] Raw DELETE request body:', text);
      body = JSON.parse(text);
    } catch (e) {
      console.error('[API] JSON parse error:', e);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!body.domain_name) {
      return NextResponse.json(
        { error: 'Missing required field: domain_name' },
        { status: 400 }
      );
    }
    
    // Use the correct URL format for the backend API
    const backendUrl = `${API_BASE_URL}/api/${user_id}/domain`;
    console.log(`[API] Making DELETE request to backend URL: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
    });
    
    console.log(`[API] Backend DELETE response status: ${response.status}`);
    
    // Get the raw response text first for debugging
    const responseText = await response.text();
    console.log(`[API] Backend raw DELETE response: ${responseText}`);
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[API] Error parsing backend DELETE response as JSON:', e);
      return NextResponse.json(
        { 
          success: response.ok,
          message: response.ok ? 'Domain deleted successfully' : 'Failed to delete domain',
          raw: responseText 
        },
        { status: response.ok ? 200 : 502 }
      );
    }
    
    if (!response.ok) {
      console.error('[API] Backend DELETE error response:', { 
        status: response.status, 
        statusText: response.statusText,
        data 
      });
      return NextResponse.json(
        { 
          error: data.error || `Backend responded with status: ${response.status} (${response.statusText})`,
          success: false
        },
        { status: response.status }
      );
    }
    
    console.log('[API] Backend DELETE success response:', data);
    return NextResponse.json({
      success: true,
      message: 'Domain deleted successfully',
      ...data
    });
  } catch (error) {
    console.error('[API] Error deleting domain:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to delete domain',
        success: false
      },
      { status: 500 }
    );
  }
} 