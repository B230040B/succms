import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "/workspaces/succms/succms/src/contexts/AuthContext.tsx"
import { supabase } from "/workspaces/succms/succms/src/lib/supabase.ts"

import { ProfileHeader } from "/workspaces/succms/succms/src/components/profile/profile-header.tsx"
import { ProfileTabs } from "/workspaces/succms/succms/src/components/profile/profile-tags.tsx"

import { Button } from "/workspaces/succms/succms/src/components/ui/button.tsx"
import { Input } from "/workspaces/succms/succms/src/components/ui/input.tsx"
import { Label } from "/workspaces/succms/succms/src/components/ui/label.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "/workspaces/succms/succms/src/components/ui/dialog.tsx"
import { Loader2, Pencil, Save, Flag } from "lucide-react"

type Role = "student" | "lecturer"

export const UserProfile = () => {
  const { userId: routeUserId } = useParams()
  const navigate = useNavigate()
  const { user: me } = useAuth()

  const viewId = routeUserId || me?.id || null
  const isOwnProfile = me?.id === viewId

  // Data state
  const [profileData, setProfileData] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followers, setFollowers] = useState<any[]>([])

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState("")

  // Edit drafts
  const [draftBio, setDraftBio] = useState("")
  const [draftAvatarFile, setDraftAvatarFile] = useState<File | null>(null)
  const [draftCoverFile, setDraftCoverFile] = useState<File | null>(null)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [previewCover, setPreviewCover] = useState<string | null>(null)
  const [deleteAvatar, setDeleteAvatar] = useState(false)
  const [deleteCover, setDeleteCover] = useState(false)
  const [imageHash, setImageHash] = useState(Date.now())

  useEffect(() => {
    if (!viewId) return
    fetchFullProfile()
  }, [viewId])

  const fetchFullProfile = async () => {
    setIsLoading(true)
    try {
      const { data: userProfile } = await supabase.from("user_profiles").select("*").eq("id", viewId).single()
      setProfileData(userProfile)
      setDraftBio(userProfile?.bio || "")
      setPreviewAvatar(userProfile?.avatar_url || null)
      setPreviewCover(userProfile?.cover_url || null)

      // Courses
      if (userProfile?.role === "lecturer") {
        const { data: taught } = await supabase
          .from("course_instructors")
          .select("courses(*)")
          .eq("user_id", viewId)
        setCourses(taught?.map((t: any) => t.courses) || [])
      } else {
        const { data: enrolled } = await supabase
          .from("enrollments")
          .select("courses(*)")
          .eq("user_id", viewId)
        setCourses(enrolled?.map((e: any) => e.courses) || [])
      }

      // Posts
      const { data: userPosts } = await supabase
        .from("course_posts")
        .select("*, courses(name, course_code)")
        .eq("author_id", viewId)
        .order("created_at", { ascending: false })
      setPosts(userPosts || [])

      // Follows
      const { data: followersData, count: followersCountData } = await supabase
        .from("follows")
        .select("follower_id, user_profiles!follows_follower_id_fkey(id, full_name, avatar_url, role)", { count: "exact" })
        .eq("following_id", viewId)
      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", viewId)
      setFollowersCount(followersCountData || 0)
      setFollowingCount(following || 0)
      setFollowers(followersData || [])

      if (!isOwnProfile && me) {
        const { data } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", me.id)
          .eq("following_id", viewId)
          .single()
        setIsFollowing(!!data)
      }
    } catch (e) {
      console.error("Error fetching profile", e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowToggle = async () => {
    if (!me || !viewId) return
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", me.id).eq("following_id", viewId)
      setIsFollowing(false)
      setFollowersCount((prev) => Math.max(prev - 1, 0))
    } else {
      await supabase.from("follows").insert({ follower_id: me.id, following_id: viewId })
      setIsFollowing(true)
      setFollowersCount((prev) => prev + 1)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    const previewUrl = URL.createObjectURL(file)
    if (type === "avatar") {
      setDraftAvatarFile(file)
      setPreviewAvatar(previewUrl)
      setDeleteAvatar(false)
    } else {
      setDraftCoverFile(file)
      setPreviewCover(previewUrl)
      setDeleteCover(false)
    }
  }

  const handleRemoveImage = (type: "avatar" | "cover") => {
    if (type === "avatar") {
      setDraftAvatarFile(null)
      setPreviewAvatar(null)
      setDeleteAvatar(true)
    } else {
      setDraftCoverFile(null)
      setPreviewCover(null)
      setDeleteCover(true)
    }
  }

  const handleCancelEdit = () => {
    setDraftBio(profileData?.bio || "")
    setPreviewAvatar(profileData?.avatar_url || null)
    setPreviewCover(profileData?.cover_url || null)
    setDraftAvatarFile(null)
    setDraftCoverFile(null)
    setDeleteAvatar(false)
    setDeleteCover(false)
    setIsEditing(false)
  }

  const handleSaveProfile = async () => {
    if (!me) return
    setIsSaving(true)
    try {
      let finalAvatarUrl = profileData?.avatar_url || null
      let finalCoverUrl = profileData?.cover_url || null

      if (draftAvatarFile) {
        const fileExt = draftAvatarFile.name.split(".").pop()
        const filePath = `${me.id}/avatar_${Date.now()}.${fileExt}`
        await supabase.storage.from("public_profiles").upload(filePath, draftAvatarFile)
        const { data } = supabase.storage.from("public_profiles").getPublicUrl(filePath)
        finalAvatarUrl = data.publicUrl
      } else if (deleteAvatar) {
        finalAvatarUrl = null
      }

      if (draftCoverFile) {
        const fileExt = draftCoverFile.name.split(".").pop()
        const filePath = `${me.id}/cover_${Date.now()}.${fileExt}`
        await supabase.storage.from("public_profiles").upload(filePath, draftCoverFile)
        const { data } = supabase.storage.from("public_profiles").getPublicUrl(filePath)
        finalCoverUrl = data.publicUrl
      } else if (deleteCover) {
        finalCoverUrl = null
      }

      const { error } = await supabase
        .from("user_profiles")
        .update({ bio: draftBio, avatar_url: finalAvatarUrl, cover_url: finalCoverUrl })
        .eq("id", me.id)

      if (error) throw error

      setProfileData((prev: any) => ({ ...prev, bio: draftBio, avatar_url: finalAvatarUrl, cover_url: finalCoverUrl }))
      setImageHash(Date.now())
      setIsEditing(false)
      setDraftAvatarFile(null)
      setDraftCoverFile(null)
      setDeleteAvatar(false)
      setDeleteCover(false)
    } catch (e: any) {
      alert("Error saving profile: " + e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReport = async () => {
    if (!reportReason || !me || !viewId) return
    await supabase.from("reports").insert({ reporter_id: me.id, reported_user_id: viewId, reason: reportReason, status: "pending" })
    setShowReportDialog(false)
    setReportReason("")
    alert("Report submitted.")
  }

  const getDisplayUrl = (url: string | null) => {
    if (!url) return undefined
    if (url.startsWith("blob:")) return url
    return `${url}?t=${imageHash}`
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
  if (!profileData) return <div className="p-8 text-center text-red-500">User not found.</div>

  const headerProps = {
    name: profileData.full_name || profileData.email,
    role: (profileData.role as Role) || "student",
    profileImage: getDisplayUrl(previewAvatar) || "/placeholder.svg",
    backgroundImage: getDisplayUrl(previewCover) || "/placeholder.svg",
    bio: profileData.bio || "",
    stats: {
      posts: posts.length,
      followers: followersCount,
      following: followingCount,
    },
  }

  const coursesProps = (courses || []).map((c: any) => ({ id: c.id, name: c.name, code: c.course_code }))
  const activitiesProps = (posts || []).map((p: any) => ({ id: p.id, type: "post", content: p.content, time: new Date(p.created_at).toLocaleString() }))

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <div className="pt-4 pb-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
        </div>

        <ProfileHeader 
          {...headerProps} 
          isEditing={isEditing}
          onAvatarChange={(file) => handleFileSelect({ target: { files: [file] } } as any, "avatar")}
          onCoverChange={(file) => handleFileSelect({ target: { files: [file] } } as any, "cover")}
          onAvatarRemove={() => handleRemoveImage("avatar")}
          onCoverRemove={() => handleRemoveImage("cover")}
        />

        {/* Actions row: edit/follow/report */}
        <div className="flex justify-between items-center gap-2 py-4">
          <div>
            {isEditing && (
              <p className="text-sm text-muted-foreground">💡 Hover over the images to change them</p>
            )}
          </div>
          <div className="flex gap-2">
            {isOwnProfile ? (
              isEditing ? (
                <>
                  <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                  <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-black text-white hover:bg-black/90">
                    {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}><Pencil className="h-4 w-4 mr-2" /> Edit Profile</Button>
              )
            ) : (
              <>
                <Button variant={isFollowing ? "outline" : "default"} onClick={handleFollowToggle}>{isFollowing ? "Following" : "Follow"}</Button>
                <Button variant="ghost" size="icon" onClick={() => setShowReportDialog(true)}><Flag className="h-4 w-4" /></Button>
              </>
            )}
          </div>
        </div>

        <ProfileTabs
          bio={profileData.bio || ""}
          email={profileData.email}
          faculty={profileData.faculty || ""}
          programme={profileData.programme || ""}
          courses={coursesProps}
          recentActivity={activitiesProps}
          followers={followers}
          isEditing={isEditing}
          draftBio={draftBio}
          onBioChange={setDraftBio}
        />

        {/* Report dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report User</DialogTitle>
            </DialogHeader>
            <Input placeholder="Reason for report..." value={reportReason} onChange={(e) => setReportReason(e.target.value)} />
            <DialogFooter>
              <Button onClick={handleReport} disabled={!reportReason}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}