import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MessageCircle, Shield } from 'lucide-react';

interface RoomCardProps {
  slug: string;
  title: string;
  topic: string;
  isMinorSafe: boolean;
  messageCount?: number;
}

export function RoomCard({ slug, title, topic, isMinorSafe, messageCount }: RoomCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => navigate(`/rooms/${slug}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-[#003B5C]">
              {title}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-600">
              {topic}
            </CardDescription>
          </div>
          {isMinorSafe && (
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
              <Shield className="w-3 h-3 mr-1" />
              Minor Safe
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-gray-500">
          <MessageCircle className="w-4 h-4 mr-2" />
          <span>{messageCount || 0} messages</span>
        </div>
      </CardContent>
    </Card>
  );
}
