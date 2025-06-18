// app/api/users/route.ts
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

let cachedClient: MongoClient | null = null;

async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) {
    try {
      // Test the connection
      await cachedClient.db('admin').command({ ping: 1 });
      return cachedClient;
    } catch (error) {
      // Connection is stale, create a new one
      cachedClient = null;
    }
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

// Middleware to verify JWT token
function verifyToken(authHeader: string | null): any {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// GET - Fetch all users
export async function GET(request: NextRequest): Promise<Response> {
  try {
    console.log('🔍 Starting user fetch request...');
    
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    console.log('🔑 Auth header present:', !!authHeader);
    
    const decoded = verifyToken(authHeader);
    console.log('✅ Token verified for user:', decoded.userId);

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    const client = await connectToDatabase();
    console.log('✅ Connected to MongoDB');

    // Use the correct database name
    const db = client.db('userManagement');
    const usersCollection = db.collection('users');
    
    console.log('🔍 Fetching users from collection...');

    // Test if we can connect to the collection
    const collectionStats = await db.listCollections({ name: 'users' }).toArray();
    console.log('📊 Collection exists:', collectionStats.length > 0);

    // Count total documents first
    const totalCount = await usersCollection.countDocuments();
    console.log('📊 Total users in collection:', totalCount);

    // Fetch all users (excluding passwords)
    const users = await usersCollection
      .find({}, {
        projection: {
          password: 0 // Exclude password field from results
        }
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .toArray();

    console.log('📊 Users fetched:', users.length);

    // Convert MongoDB ObjectIds and dates to strings for JSON serialization
    const processedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString(),
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    }));

    console.log('✅ Users processed successfully');

    return new Response(JSON.stringify({
      success: true,
      users: processedUsers,
      count: processedUsers.length,
      message: `Found ${processedUsers.length} users`
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error: unknown) {
    console.error('❌ Error fetching users:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle authentication errors
    if (errorMessage === 'No token provided' || 
        errorMessage === 'Invalid token' || 
        errorMessage.includes('JWT_SECRET')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Unauthorized access',
        error: errorMessage
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle other errors
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch users',
      error: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}