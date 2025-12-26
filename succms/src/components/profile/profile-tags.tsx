"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "/workspaces/succms/succms/src/components/ui/tabs.tsx"
import { ProfileInfo } from "./profile-info"
import { CoursesSection } from "./courses-section"
import { ActivitySection } from "./activity-section"
import { Grid3x3, Heart, UserCheck, ImageIcon } from "lucide-react"

interface Course {
  id: number
  name: string
  code: string
}

interface Activity {
  id: number
  type: string
  content: string
  time: string
}

interface Follower {
  follower_id: string
  user_profiles: {
    id: string
    full_name: string
    avatar_url: string | null
    role: string
  }
}

interface ProfileTabsProps {
  bio: string
  email: string
  faculty: string
  programme: string
  courses: Course[]
  recentActivity: Activity[]
  followers?: Follower[]
  isEditing?: boolean
  draftBio?: string
  onBioChange?: (bio: string) => void
}

export function ProfileTabs({ bio, email, faculty, programme, courses, recentActivity, followers = [], isEditing = false, draftBio = "", onBioChange }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid h-12 w-full grid-cols-4 rounded-none border-t bg-card">
        <TabsTrigger value="profile" className="gap-2">
          <Grid3x3 className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="courses" className="gap-2">
          <ImageIcon className="h-4 w-4" />
          Courses
        </TabsTrigger>
        <TabsTrigger value="activity" className="gap-2">
          <Heart className="h-4 w-4" />
          Activity
        </TabsTrigger>
        <TabsTrigger value="followers" className="gap-2">
          <UserCheck className="h-4 w-4" />
          Followers
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <ProfileInfo bio={bio} email={email} faculty={faculty} programme={programme} isEditing={isEditing} draftBio={draftBio} onBioChange={onBioChange} />
      </TabsContent>

      <TabsContent value="courses" className="mt-6">
        <CoursesSection courses={courses} />
      </TabsContent>

      <TabsContent value="activity" className="mt-6">
        <ActivitySection activities={recentActivity} />
      </TabsContent>

      <TabsContent value="followers" className="mt-6">
        <div className="rounded-lg border bg-card">
          {followers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No followers yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {followers.map((follower) => (
                <div key={follower.follower_id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                    {follower.user_profiles.avatar_url ? (
                      <img src={follower.user_profiles.avatar_url} alt={follower.user_profiles.full_name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold">{follower.user_profiles.full_name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{follower.user_profiles.full_name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{follower.user_profiles.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
