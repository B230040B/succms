import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Megaphone, Calendar, AlertCircle, ExternalLink } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Advertisement {
  id: number;
  title: string;
  type: "announcement" | "event" | "notice";
  content: string;
  image?: string;
  date: string;
  priority: "high" | "medium" | "low";
  link?: string;
}

const mockAdvertisements: Advertisement[] = [
  {
    id: 1,
    title: "Campus Career Fair 2024",
    type: "event",
    content: "Join us for the annual career fair. Meet with top employers and explore internship opportunities.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
    date: "March 25, 2024",
    priority: "high",
    link: "#"
  },
  {
    id: 2,
    title: "Library Hours Extended",
    type: "announcement",
    content: "The university library will now be open 24/7 during exam week to support your studies.",
    date: "March 15, 2024",
    priority: "medium"
  },
  {
    id: 3,
    title: "Spring Break Notice",
    type: "notice",
    content: "Campus facilities will operate on reduced hours during spring break (March 18-22).",
    date: "March 10, 2024",
    priority: "low"
  },
  {
    id: 4,
    title: "Guest Lecture: AI in Healthcare",
    type: "event",
    content: "Dr. Jane Smith from MIT will present on AI applications in modern healthcare.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
    date: "March 28, 2024",
    priority: "high",
    link: "#"
  },
  {
    id: 5,
    title: "Student Wellness Week",
    type: "event",
    content: "Free yoga, meditation sessions, and mental health workshops all week long.",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400",
    date: "April 1-5, 2024",
    priority: "medium",
    link: "#"
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "event":
      return Calendar;
    case "announcement":
      return Megaphone;
    case "notice":
      return AlertCircle;
    default:
      return Megaphone;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "event":
      return "bg-purple-100 text-purple-800";
    case "announcement":
      return "bg-blue-100 text-blue-800";
    case "notice":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function AdvertisementPanel() {
  return (
    <Card className="border-l-4 border-l-blue-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-blue-600" />
          Campus Updates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockAdvertisements.map((ad) => {
          const Icon = getTypeIcon(ad.type);
          return (
            <div
              key={ad.id}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50"
            >
              {ad.image && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <h4 className="text-sm font-medium">{ad.title}</h4>
                  </div>
                  <Badge className={getPriorityColor(ad.priority)}>
                    {ad.priority}
                  </Badge>
                </div>
                
                <Badge className={getTypeColor(ad.type)} variant="outline">
                  {ad.type}
                </Badge>
                
                <p className="text-sm text-muted-foreground">{ad.content}</p>
                
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">{ad.date}</p>
                  {ad.link && (
                    <Button variant="link" size="sm" className="h-auto p-0">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Learn More
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
