import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email, password, userType } = await request.json();

    // Validate required fields
    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Email, password, and user type are required' },
        { status: 400 }
      );
    }

    // Handle admin login
    if (userType === 'admin') {
      // Find admin by email
      const admin = await prisma.admin.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!admin) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin.id, 
          email: admin.email, 
          role: admin.role,
          userType: 'admin'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Return success response with token and user info (excluding password)
      const { password: _, ...adminData } = admin;
      
      // Create response with cookie
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        token,
        user: adminData,
        userType: 'admin'
      });

      // Set the token as an HTTP-only cookie
      response.cookies.set('token', token, {
        httpOnly: false, // Allow JavaScript access for now
        secure: false, // Allow HTTP for local development
        sameSite: 'lax',
        maxAge: 86400, // 24 hours
        path: '/'
      });

      return response;
    }

    // Handle resident login (placeholder for future implementation)
    if (userType === 'resident') {
      return NextResponse.json(
        { error: 'Resident login not implemented yet' },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid user type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 