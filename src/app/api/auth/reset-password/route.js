import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Use Firebase Auth REST API to send password reset email
    const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;
    
    const response = await fetch(firebaseAuthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestType: 'PASSWORD_RESET',
        email: email.toLowerCase(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firebase password reset error:', data);
      
      if (data.error?.message === 'EMAIL_NOT_FOUND') {
        return NextResponse.json(
          { error: 'No account found with this email address' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully. Please check your email.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 