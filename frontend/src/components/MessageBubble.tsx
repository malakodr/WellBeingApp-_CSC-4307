import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle } from 'lucide-react';

interface MessageBubbleProps {
  author: {
    id: string;
    displayName: string;
  };
  body: string;
  timestamp: string | Date;
  flagged: boolean;
  isCurrentUser?: boolean;
}

export function MessageBubble({ 
  author, 
  body, 
  timestamp, 
  flagged, 
  isCurrentUser 
}: MessageBubbleProps) {
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  return (
    <div className={`mb-4 ${isCurrentUser ? 'flex justify-end' : 'flex justify-start'}`}>
      <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
          <div className="text-sm font-medium text-gray-700 mb-1">
            {author.displayName}
          </div>
        )}
        
        <div
          className={`rounded-lg px-4 py-2 ${
            isCurrentUser
              ? 'bg-[#003B5C] text-white'
              : 'bg-gray-200 text-gray-900'
          } ${flagged ? 'border-2 border-red-500' : ''}`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{body}</p>
        </div>

        <div className="text-xs text-gray-500 mt-1 flex items-center">
          <span>{timeAgo}</span>
        </div>

        {flagged && (
          <Alert variant="destructive" className="mt-2 border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This message is under review by moderators
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
