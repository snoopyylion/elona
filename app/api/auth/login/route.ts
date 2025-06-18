// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { comparePassword, generateToken, sanitizeUser, isValidEmail } from '@/lib/auth';
import { User } from '@/types/user'; // Import from your central types file

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format'
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('userManagement');
    const users = db.collection('users');

    const rawUser = await users.findOne({ email: email.toLowerCase() });

    if (!rawUser) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    const isValidPassword = await comparePassword(password, rawUser.password);
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    // Create user object with consistent string types for dates
    const user: User = {
      _id: rawUser._id.toString(),
      email: rawUser.email,
      password: rawUser.password,
      name: rawUser.name,
      createdAt: rawUser.createdAt ? rawUser.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: rawUser.updatedAt ? rawUser.updatedAt.toISOString() : new Date().toISOString(),
      lastLogin: rawUser.lastLogin ? rawUser.lastLogin.toISOString() : null
    };

    const token = generateToken(user._id);

    // Update last login
    await users.updateOne(
      { _id: rawUser._id },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user)
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}