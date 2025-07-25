import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Format phone number to international format
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    
    // If starts with 0, replace with 63 (Philippines)
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '63' + formattedPhone.substring(1);
    }
    
    // Add + if not present
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    // Return success - the actual SMS sending will be handled by Firebase Auth on the client side
    // This endpoint is mainly for validation and formatting
    return NextResponse.json(
      { 
        success: true, 
        message: 'Phone number validated. SMS will be sent via Firebase Auth.',
        formattedPhoneNumber: formattedPhone
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Firebase SMS preparation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to prepare SMS sending. Please try again.' },
      { status: 500 }
    );
  }
} 