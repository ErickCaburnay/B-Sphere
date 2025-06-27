import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear the token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 