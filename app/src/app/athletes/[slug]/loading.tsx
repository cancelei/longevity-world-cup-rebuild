import { ProfileSkeleton } from "@/components/ui/skeleton";

export default function AthleteProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-radial py-8 px-4">
      <ProfileSkeleton />
    </div>
  );
}
