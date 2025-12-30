import { ProfileHeader } from "./profile/profile-header"
import { ProfileTabs } from "./profile/profile-tags"

export default function ProfilePage() {
  // Mock user data - in a real app, this would come from your database/API
  const userData = {
    name: "John Smith",
    role: "student" as "student" | "lecturer",
    email: "john.smith@university.edu",
    faculty: "Faculty of Computer Science",
    programme: "BSc Computer Science",
    bio: "Passionate computer science student interested in AI and machine learning. Love collaborating on innovative projects and expanding my knowledge through continuous learning.",
    profileImage: "/professional-student-profile-photo.jpg",
    backgroundImage: "/images/profile-background.jpg",
    stats: {
      posts: 42,
      followers: 1248,
      following: 356,
    },
    courses: [
      { id: 1, name: "Data Structures & Algorithms", code: "CS201" },
      { id: 2, name: "Machine Learning", code: "CS401" },
      { id: 3, name: "Web Development", code: "CS305" },
    ],
    recentActivity: [
      { id: 1, type: "post", content: "Completed my ML project!", time: "2 hours ago" },
      { id: 2, type: "like", content: "Liked a post about React", time: "5 hours ago" },
      { id: 3, type: "follow", content: "Started following Dr. Anderson", time: "1 day ago" },
    ],
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl">
        <ProfileHeader
          name={userData.name}
          role={userData.role}
          profileImage={userData.profileImage}
          backgroundImage={userData.backgroundImage}
          bio={userData.bio}
          stats={userData.stats}
        />

        <ProfileTabs
          bio={userData.bio}
          email={userData.email}
          faculty={userData.faculty}
          programme={userData.programme}
          courses={userData.courses}
          recentActivity={userData.recentActivity}
        />
      </div>
    </div>
  )
}
