import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { factCheckId: string } }
) {
  try {
    const { factCheckId } = params;
    const body = await request.json();
    const { userEmail, claim, verdict, reasons, comments, type } = body;

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

    if (!type || !['like', 'dislike'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Valid feedback type (like/dislike) is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual feedback functionality
    // This could involve:
    // 1. Storing the feedback in a database
    // 2. Storing reasons and comments
    // 3. Preventing duplicate feedback from the same user
    // 4. Calculating and awarding credits
    // 5. Returning success confirmation

    console.log('Fact check feedback:', {
      factCheckId,
      userEmail,
      claim,
      verdict,
      type,
      reasons: reasons || [],
      comments: comments || '',
      timestamp: new Date().toISOString()
    });

    // Calculate credits based on feedback type and content
    const hasTextFeedback = comments && comments.trim().length > 0;
    const baseCredits = 3;
    const textBonus = hasTextFeedback ? 3 : 0;
    const totalCredits = baseCredits + textBonus;

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        factCheckId,
        userEmail,
        type,
        reasons: reasons || [],
        comments: comments || '',
        creditsAwarded: totalCredits,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting fact check feedback:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit feedback' 
      },
      { status: 500 }
    );
  }
}
