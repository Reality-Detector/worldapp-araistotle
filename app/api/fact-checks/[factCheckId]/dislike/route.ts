import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { factCheckId: string } }
) {
  try {
    const { factCheckId } = params;
    const body = await request.json();
    const { userEmail, claim, verdict } = body;

    console.log('API Dislike endpoint called:', {
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

    // TODO: Implement actual dislike functionality
    // This could involve:
    // 1. Storing the dislike in a database
    // 2. Updating dislike counts
    // 3. Preventing duplicate dislikes from the same user
    // 4. Returning updated dislike count

    console.log('Fact check dislike:', {
      factCheckId,
      userEmail,
      claim,
      verdict,
      timestamp: new Date().toISOString()
    });

    // Award credits for disliking (constructive feedback)
    const creditsAwarded = 1;
    const rewardMessage = 'Thanks for your feedback!';

    return NextResponse.json({
      success: true,
      message: 'Fact check disliked successfully',
      data: {
        factCheckId,
        userEmail,
        disliked: true,
        creditsAwarded: creditsAwarded,
        rewardMessage: rewardMessage,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error disliking fact check:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to dislike fact check' 
      },
      { status: 500 }
    );
  }
}
