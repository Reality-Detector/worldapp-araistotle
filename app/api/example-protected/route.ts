import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// JWKS client for Worldcoin token validation
const client = jwksClient({
  jwksUri: 'https://id.worldcoin.org/.well-known/jwks.json',
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

async function validateToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const validator = request.headers.get('validator');

  // Check Validator header
  if (validator !== 'worldapp') {
    return {
      success: false,
      error: 'Invalid validator header',
      user: null
    };
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      error: 'No valid authorization header',
      user: null
    };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, {
        audience: process.env.WLD_CLIENT_ID,
        issuer: 'https://id.worldcoin.org',
        algorithms: ['RS256']
      }, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    return {
      success: true,
      error: null,
      user: {
        id: (decoded as any).sub,
        verificationLevel: (decoded as any)['https://id.worldcoin.org/v1']?.verification_level,
        ...(decoded as any)
      }
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return {
      success: false,
      error: 'Invalid or expired token',
      user: null
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate the token
    const validation = await validateToken(request);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: validation.error, 
          success: false 
        },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();
    
    // Your protected logic here
    console.log('Authenticated user:', validation.user);
    console.log('Request payload:', body);

    // Example response
    return NextResponse.json({
      success: true,
      data: {
        message: 'Successfully authenticated!',
        userId: validation.user?.id,
        verificationLevel: validation.user?.verificationLevel,
        timestamp: new Date().toISOString()
      },
      user: {
        id: validation.user?.id,
        verificationLevel: validation.user?.verificationLevel
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        success: false 
      },
      { status: 500 }
    );
  }
}

// Example GET endpoint
export async function GET(request: NextRequest) {
  const validation = await validateToken(request);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      message: 'This is a protected GET endpoint',
      user: validation.user?.id
    }
  });
}

