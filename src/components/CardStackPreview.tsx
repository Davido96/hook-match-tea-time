
import { Card } from "@/components/ui/card";

interface User {
  id: number;
  name: string;
  age: number;
  image: string;
  verification_status?: 'verified' | 'pending' | 'rejected';
  user_type?: 'creator' | 'consumer';
}

interface CardStackPreviewProps {
  users: User[];
  currentIndex: number;
}

const CardStackPreview = ({ users, currentIndex }: CardStackPreviewProps) => {
  const getPreviewUsers = () => {
    const preview = [];
    for (let i = 1; i <= 3; i++) {
      const index = currentIndex + i;
      if (index < users.length) {
        preview.push({ user: users[index], position: i });
      }
    }
    return preview;
  };

  const previewUsers = getPreviewUsers();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {previewUsers.map(({ user, position }) => (
        <Card
          key={user.id}
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg"
          style={{
            transform: `scale(${1 - position * 0.05}) translateY(${position * 8}px)`,
            zIndex: -position,
            opacity: 1 - position * 0.3
          }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${user.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold">{user.name}</span>
              <span className="text-sm opacity-80">{user.age}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CardStackPreview;
