/**
 * Backend validation utilities for access tokens
 * This file contains examples for different backend frameworks
 */

// ============================================================================
// EXPRESS.JS / NODE.JS BACKEND VALIDATION
// ============================================================================

import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// JWKS client for Worldcoin token validation
const client = jwksClient({
  jwksUri: 'https://id.worldcoin.org/.well-known/jwks.json',
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  // Note: do not duplicate keys — jwksUri already set above
});

function getKey(header: any, callback: (err: Error | null, signingKey?: string | Buffer | undefined) => void) {
  client.getSigningKey(header.kid, (err: Error | null, key: any) => {
    if (err) {
      callback(err);
      return;
    }
    // getPublicKey may return a string or Buffer depending on implementation
    const signingKey = key?.getPublicKey ? key.getPublicKey() as string | Buffer : undefined;
    callback(null, signingKey);
  });
}

// Middleware for Express.js
export function validateWorldcoinToken(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const validator = req.headers.validator;

  // Check if Validator header is correct
  if (validator !== 'worldapp') {
    return res.status(401).json({ 
      error: 'Invalid validator header',
      success: false 
    });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'No valid authorization header',
      success: false 
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  jwt.verify(token, getKey, {
    audience: process.env.WLD_CLIENT_ID, // Your Worldcoin client ID
    issuer: 'https://id.worldcoin.org',
    algorithms: ['RS256']
  }, (err: Error | null, decoded?: unknown) => {
    if (err) {
      console.error('Token validation error:', err);
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        success: false 
      });
    }

    // Add user info to request object
    const d = decoded as any;
    req.user = {
      id: d?.sub,
      verificationLevel: d?.['https://id.worldcoin.org/v1']?.verification_level,
      ...d
    };
    
    next();
  });
}

// ============================================================================
// NEXT.JS API ROUTE VALIDATION
// ============================================================================

export async function validateTokenInNextJS(request: Request) {
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
    const decoded = await new Promise<unknown>((resolve, reject) => {
      jwt.verify(token, getKey, {
        audience: process.env.WLD_CLIENT_ID,
        issuer: 'https://id.worldcoin.org',
        algorithms: ['RS256']
      }, (err: Error | null, decoded?: unknown) => {
        if (err) reject(err);
        else resolve(decoded as unknown);
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

// ============================================================================
// PYTHON (FASTAPI/FLASK) VALIDATION
// ============================================================================

/*
# Python example using PyJWT and requests
import jwt
import requests
from functools import wraps

def get_public_key(token):
    # Decode header to get kid
    header = jwt.get_unverified_header(token)
    kid = header['kid']
    
    # Get JWKS from Worldcoin
    jwks_url = 'https://id.worldcoin.org/.well-known/jwks.json'
    jwks = requests.get(jwks_url).json()
    
    # Find the key
    for key in jwks['keys']:
        if key['kid'] == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key)
    
    raise ValueError('Unable to find appropriate key')

def validate_worldcoin_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        validator = request.headers.get('Validator')
        
        if validator != 'worldapp':
            return {'error': 'Invalid validator header'}, 401
            
        if not token:
            return {'error': 'No token provided'}, 401
            
        try:
            public_key = get_public_key(token)
            payload = jwt.decode(
                token, 
                public_key, 
                algorithms=['RS256'],
                audience=os.getenv('WLD_CLIENT_ID'),
                issuer='https://id.worldcoin.org'
            )
            request.user = payload
        except jwt.ExpiredSignatureError:
            return {'error': 'Token has expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Invalid token'}, 401
            
        return f(*args, **kwargs)
    return decorated_function
*/

// ============================================================================
// EXAMPLE USAGE IN NEXT.JS API ROUTE
// ============================================================================

/*
// app/api/protected/route.ts
import { validateTokenInNextJS } from '@/utils/backendValidation';

export async function POST(request: Request) {
  const validation = await validateTokenInNextJS(request);
  
  if (!validation.success) {
    return Response.json(
      { error: validation.error, success: false },
      { status: 401 }
    );
  }
  
  const { user } = validation;
  const body = await request.json();
  
  // Your protected logic here
  return Response.json({
    success: true,
    data: { message: 'Protected data', user: user.id },
    user: user
  });
}
*/

// ============================================================================
// ENVIRONMENT VARIABLES NEEDED
// ============================================================================

/*
# Add these to your backend .env file:
WLD_CLIENT_ID=your_worldcoin_client_id
WLD_CLIENT_SECRET=your_worldcoin_client_secret
*/

// ============================================================================
// INSTALLATION COMMANDS
// ============================================================================

/*
# For Node.js/Express backend:
npm install jsonwebtoken jwks-rsa
npm install @types/jsonwebtoken @types/jwks-rsa --save-dev

# For Python backend:
pip install PyJWT requests cryptography
*/

