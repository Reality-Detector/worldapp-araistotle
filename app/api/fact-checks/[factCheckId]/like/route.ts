import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { factCheckId: string } }
) {
  try {
    const { factCheckId } = params;
    const body = await request.json();
    const { userEmail, claim, verdict } = body;

    console.log('API Like endpoint called:', {
      factCheckId,
      body,
      userEmail,
      claim,
      verdict
    });

    if (!factCheckId) {
      return NextResponse.json(
        { success: false, error: 'Fact check ID is required' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual like functionality
    // This could involve:
    // 1. Storing the like in a database
    // 2. Updating like counts
    // 3. Preventing duplicate likes from the same user
    // 4. Returning updated like count

    console.log('Fact check like:', {
      factCheckId,
      userEmail,
      claim,
      verdict,
      timestamp: new Date().toISOString()
    });

    // Award credits for liking
    const creditsAwarded = 1;
    const rewardMessage = 'Thanks for liking this fact check!';

    return NextResponse.json({
      success: true,
      message: 'Fact check liked successfully',
      data: {
        factCheckId,
        userEmail,
        liked: true,
        creditsAwarded: creditsAwarded,
        rewardMessage: rewardMessage,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error liking fact check:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to like fact check' 
      },
      { status: 500 }
    );
  }
}
