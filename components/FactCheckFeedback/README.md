# FactCheckFeedback Component

A React component that provides like/dislike feedback functionality for fact checks, based on the TaskActions component design.

## Features

- **Like/Dislike Buttons**: Users can like or dislike fact checks
- **Feedback Dialog**: Opens when users click like/dislike, allowing them to provide detailed feedback
- **Reason Selection**: Predefined reasons for liking/disliking (different for each type)
- **Text Feedback**: Optional text input for additional comments
- **Credit System**: Awards credits based on feedback type and content
- **Animations**: Success animations when credits are awarded
- **Responsive Design**: Works on mobile and desktop using Tailwind CSS

## Props

```typescript
interface FactCheckFeedbackProps {
  factCheckId: string;        // Unique identifier for the fact check
  claim: string;              // The claim being fact-checked
  verdict?: string;           // The verdict of the fact check (True/False/etc.)
  userEmail?: string;         // User's email for authentication
  backendUrl?: string;        // Backend URL for API calls
  accessToken?: string;       // Access token for authentication
}
```

## API Endpoints

The component expects the following API endpoints to be available:

- `POST /api/fact-checks/[factCheckId]/like` - Submit a like
- `POST /api/fact-checks/[factCheckId]/dislike` - Submit a dislike  
- `POST /api/fact-checks/[factCheckId]/feedback` - Submit detailed feedback

## Usage

```tsx
import FactCheckFeedback from '../FactCheckFeedback';

<FactCheckFeedback
  factCheckId="fact-check-123"
  claim="The sky is blue"
  verdict="True"
  userEmail="user@example.com"
  backendUrl="https://api.example.com"
  accessToken="your-access-token"
/>
```

## Credit System

- **Base credits**: 3 credits for any feedback
- **Text bonus**: +3 additional credits for written feedback
- **Total possible**: 6 credits (3 base + 3 text bonus)

## Styling

The component uses Tailwind CSS classes and follows the existing design system:
- Primary color: `#0066FF` (blue)
- Success animations with confetti-like effects
- Responsive design with mobile-first approach
- Consistent with the app's visual language

## State Management

The component manages its own state for:
- Like/dislike status
- Feedback dialog visibility
- Loading states
- Animation states
- Form data (reasons, comments)

## Integration

The component is integrated into the `HomeContent` component and appears at the bottom of each expanded fact check result, separated by a border.
