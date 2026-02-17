import { useMemo } from "react";
import HeroSection from "../components/HeroSection";
import SponsorsMarquee from "../components/SponsorsMarquee";
import RankSection from "../components/RankSection";
import FeaturesSection from "../components/FeaturesSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import { Trophy, Target, TrendingUp, BarChart3, Users, Award, Crown, Flame, Star, Gem } from "lucide-react";

export default function LandingPage() {
    // Memoize static data to prevent unnecessary re-creation
    const ranks = useMemo(() => [
        { name: "Bronze", mmr: "0-500 MMR", color: "var(--rank-bronze)", icon: Award },
        { name: "Silver", mmr: "500-1000 MMR", color: "var(--rank-silver)", icon: Star },
        { name: "Gold", mmr: "1000-1500 MMR", color: "var(--rank-gold)", icon: Trophy },
        { name: "Platinum", mmr: "1500-2000 MMR", color: "var(--rank-platinum)", icon: Gem },
        { name: "Diamond", mmr: "2000-2500 MMR", color: "var(--rank-diamond)", icon: Gem },
        { name: "Master", mmr: "2500-3000 MMR", color: "var(--rank-master)", icon: Crown },
        { name: "Elite", mmr: "3000+ MMR", color: "var(--rank-elite)", icon: Flame }
    ], []);

    const features = useMemo(() => [
        {
            icon: Trophy,
            title: "Weekly Tournaments",
            desc: "Compete in structured tournaments with prize pools. Track brackets, schedules, and results in real-time.",
            color: "var(--brand-primary)"
        },
        {
            icon: Target,
            title: "MMR System",
            desc: "Fair matchmaking based on skill rating. Climb ranks with every win and improve your competitive standing.",
            color: "var(--status-warning)"
        },
        {
            icon: TrendingUp,
            title: "Global Rankings",
            desc: "Compare your performance against the best players worldwide. Detailed stats and leaderboards.",
            color: "var(--status-success)"
        },
        {
            icon: BarChart3,
            title: "Performance Analytics",
            desc: "Track your progress with detailed statistics, match history, and performance metrics.",
            color: "#9333EA"
        },
        {
            icon: Users,
            title: "Team Management",
            desc: "Create or join teams, coordinate strategies, and compete together in team tournaments.",
            color: "#0EA5E9"
        },
        {
            icon: Award,
            title: "Achievement System",
            desc: "Unlock exclusive achievements, showcase your accomplishments, and earn special rewards.",
            color: "var(--status-warning)"
        }
    ], []);

    return (
        <div className="bg-[var(--neutral-bg)] text-white">
            <HeroSection />
            <SponsorsMarquee />
            <RankSection ranks={ranks} />
            <FeaturesSection features={features} />
            <CTASection />
            <Footer />
        </div>
    );
}