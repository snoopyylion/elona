// app/api/auth/sign-up/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hashPassword, generateToken, sanitizeUser, isValidEmail, isValidPassword } from '@/lib/auth';
import { User } from '@/types/user'; // Import from your central types file

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name }: SignupData = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        message: 'Email, password, and name are required'
      }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format'
      }, { status: 400 });
    }

    if (!isValidPassword(password)) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db('userManagement');
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User already exists with this email'
      }, { status: 400 });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await users.insertOne(newUser);
    
    // Create user object with consistent string types for dates
    const userWithId: User = {
      _id: result.insertedId.toString(),
      email: newUser.email,
      password: newUser.password,
      name: newUser.name,
      createdAt: newUser.createdAt.toISOString(), // Convert to string
      updatedAt: newUser.updatedAt.toISOString(), // Convert to string
    };

    // Generate token
    const token = generateToken(result.insertedId.toString());

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      token,
      user: sanitizeUser(userWithId)
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}