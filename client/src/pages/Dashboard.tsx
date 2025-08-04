import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { type Solution, type UserProgress } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import PersonalizedInsights from "@/components/PersonalizedInsights";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Type assertion for user data
  const typedUser = user as any;

  const { data: userSolutions = [], isLoading: solutionsLoading } = useQuery<Solution[]>({
    queryKey: ['/api/users', typedUser?.id, 'solutions'],
    enabled: !!typedUser?.id,
  });

  const { data: userProgress, isLoading: progressLoading } = useQuery<UserProgress>({
    queryKey: ['/api/users', typedUser?.id, 'progress'],
    enabled: !!typedUser?.id,
  });

  const handleLogout = async () => {
    try {
      // Clear any local state
      localStorage.removeItem('synergy-sphere-tutorial');
      
      // Perform logout - use replace to ensure clean navigation
      window.location.replace('/api/logout');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!typedUser) {
    setLocation('/auth');
    return null;
  }

  const getBadgeIcon = (badge: string): string => {
    switch (badge) {
      case 'master_solver': return '🎯';
      case 'collaborator': return '🤝';
      case 'explorer': return '🌍';
      case 'innovator': return '💡';
      default: return '🏅';
    }
  };

  const getBadgeName = (badge: string) => {
    switch (badge) {
      case 'master_solver': return 'Master Solver';
      case 'collaborator': return 'Collaborator';
      case 'explorer': return 'Explorer';
      case 'innovator': return 'Innovator';
      default: return 'Achievement';
    }
  };

  return (
    <div className="min-h-screen bg-soft-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-earth-green to-forest-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {typedUser.firstName?.charAt(0) || typedUser.username?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <h1 className="font-quicksand font-bold text-4xl">
                  Welcome back, {typedUser.firstName || typedUser.username}!
                </h1>
                <p className="text-white/80 text-lg">
                  {typedUser.bio || "Ready to shape our planet's future?"}
                </p>
                {typedUser.location && (
                  <p className="text-white/70 text-sm mt-1">📍 {typedUser.location}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="secondary"
                onClick={() => setLocation('/')}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                Back to Explore
              </Button>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg border-earth-green/10">
              <CardHeader>
                <CardTitle className="font-quicksand text-xl text-earth-green">Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-earth-green to-forest-green rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {typedUser.firstName?.charAt(0) || typedUser.username?.charAt(0) || '?'}
                    </span>
                  </div>
                  <h3 className="font-quicksand font-semibold text-lg text-earth-green">
                    {typedUser.firstName && typedUser.lastName ? `${typedUser.firstName} ${typedUser.lastName}` : typedUser.username}
                  </h3>
                  <p className="text-sm text-gray-600">@{typedUser.username}</p>
                </div>

                {/* Badges */}
                {userProgress?.badges && Array.isArray(userProgress.badges) && userProgress.badges.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Badges Earned</h4>
                    <div className="space-y-2">
                      {(userProgress.badges as string[]).map((badge: string) => (
                        <div key={badge} className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-earth-green rounded-full flex items-center justify-center text-xs">
                            {getBadgeIcon(badge)}
                          </div>
                          <span className="text-sm text-earth-green font-medium">
                            {getBadgeName(badge)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full border-earth-green text-earth-green hover:bg-earth-green hover:text-white"
                  onClick={() => setLocation('/auth')}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Statistics Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-earth-green/5 border-earth-green/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-earth-green mb-2">
                    {userProgress?.solutionsCreated || 0}
                  </div>
                  <div className="text-sm text-gray-600">Solutions Created</div>
                  <div className="mt-2 text-xs text-green-600">
                    {userSolutions.length > 0 && `Latest: ${formatDistanceToNow(new Date(userSolutions[0].createdAt))} ago`}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-sky-blue/5 border-sky-blue/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-sky-blue mb-2">
                    {userProgress?.averageSynergyScore?.toFixed(0) || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Avg. Synergy Score</div>
                  <div className="mt-2 text-xs text-green-600">
                    {(userProgress?.averageSynergyScore || 0) > 70 ? '↗ Excellent' : '↗ Improving'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-sandstone/5 border-sandstone/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-sandstone mb-2">
                    {userProgress?.regionsExplored || 0}
                  </div>
                  <div className="text-sm text-gray-600">Regions Explored</div>
                  <div className="mt-2 text-xs text-gray-600">
                    Out of 195 countries
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <Card className="shadow-lg border-earth-green/10">
              <CardHeader>
                <CardTitle className="font-quicksand text-xl text-earth-green">Your Impact Journey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Global Exploration Progress</span>
                    <span className="text-sm text-earth-green font-bold">
                      {userProgress?.regionsExplored || 0}/195
                    </span>
                  </div>
                  <Progress 
                    value={((userProgress?.regionsExplored || 0) / 195) * 100} 
                    className="h-3"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Community Engagement</span>
                    <span className="text-sm text-sky-blue font-bold">
                      {userProgress?.totalCommunityInteractions || 0} interactions
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(((userProgress?.totalCommunityInteractions || 0) / 100) * 100, 100)} 
                    className="h-3"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="text-center p-4 bg-earth-green/5 rounded-xl">
                    <div className="text-2xl font-bold text-earth-green mb-1">
                      {(userSolutions.reduce((sum, sol) => sum + (sol.likesCount || 0), 0))}
                    </div>
                    <div className="text-sm text-gray-600">Total Likes Received</div>
                  </div>
                  <div className="text-center p-4 bg-sky-blue/5 rounded-xl">
                    <div className="text-2xl font-bold text-sky-blue mb-1">
                      {(userSolutions.reduce((sum, sol) => sum + (sol.commentsCount || 0), 0))}
                    </div>
                    <div className="text-sm text-gray-600">Comments on Your Work</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personalized Climate Insights */}
            <div className="mb-8">
              <PersonalizedInsights />
            </div>

            {/* Recent Solutions */}
            <Card className="shadow-lg border-earth-green/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-quicksand text-xl text-earth-green">Your Solutions</CardTitle>
                <Button
                  variant="outline"
                  className="border-earth-green text-earth-green hover:bg-earth-green hover:text-white"
                  onClick={() => setLocation('/#solve')}
                >
                  Create New Solution
                </Button>
              </CardHeader>
              <CardContent>
                {solutionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="loading-spinner w-8 h-8"></div>
                  </div>
                ) : userSolutions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Solutions Yet</h3>
                    <p className="text-gray-500 mb-4">Start creating solutions to see them here</p>
                    <Button
                      className="bg-earth-green text-white hover:bg-forest-green"
                      onClick={() => setLocation('/#solve')}
                    >
                      Create Your First Solution
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userSolutions.slice(0, 5).map((solution) => (
                      <div key={solution.id} className="border border-gray-200 rounded-xl p-6 hover:border-earth-green/30 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 mb-2">{solution.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{solution.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatDistanceToNow(new Date(solution.createdAt))} ago</span>
                              <Badge variant="secondary" className="text-xs">
                                {solution.challenge.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-earth-green mb-1">
                              {Math.round(solution.synergyScore)}%
                            </div>
                            <div className="text-xs text-gray-600">Synergy Score</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4 text-earth-green" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                              </svg>
                              <span className="text-sm text-gray-600">{solution.likesCount || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4 text-sky-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                              </svg>
                              <span className="text-sm text-gray-600">{solution.commentsCount || 0}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-earth-green hover:text-forest-green"
                            onClick={() => {
                              if (solution.shareableLink) {
                                const shareUrl = `${window.location.origin}/solution/${solution.shareableLink}`;
                                navigator.clipboard.writeText(shareUrl);
                                toast({
                                  title: "Link Copied!",
                                  description: "Share link has been copied to your clipboard.",
                                });
                              }
                            }}
                          >
                            📋 Copy Link
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {userSolutions.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" className="border-earth-green text-earth-green hover:bg-earth-green hover:text-white">
                          View All Solutions ({userSolutions.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
