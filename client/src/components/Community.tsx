import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share2, User } from "lucide-react";

interface SolutionWithUser {
  id: number;
  title: string;
  description: string;
  challenge: string;
  synergyScore: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  user: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  } | null;
  comments?: CommentWithUser[];
}

interface CommentWithUser {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  } | null;
}

export default function Community() {
  const [filter, setFilter] = useState<'latest' | 'top_rated'>('latest');
  const [selectedSolution, setSelectedSolution] = useState<SolutionWithUser | null>(null);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: solutions = [], isLoading } = useQuery<SolutionWithUser[]>({
    queryKey: ['/api/solutions'],
    staleTime: 30000, // 30 seconds
  });

  const likeMutation = useMutation({
    mutationFn: async (solutionId: number) => {
      await apiRequest('POST', `/api/solutions/${solutionId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/solutions'] });
      toast({
        title: "Solution Liked!",
        description: "Your like has been recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Like",
        description: error.message || "You may have already liked this solution.",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ solutionId, content }: { solutionId: number; content: string }) => {
      const response = await apiRequest('POST', `/api/solutions/${solutionId}/comments`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/solutions'] });
      setNewComment("");
      toast({
        title: "Comment Added!",
        description: "Your comment has been posted.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Comment",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLike = (solutionId: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to like solutions.",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate(solutionId);
  };

  const handleComment = (solutionId: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to comment.",
        variant: "destructive",
      });
      return;
    }
    if (!newComment.trim()) return;
    
    commentMutation.mutate({ solutionId, content: newComment.trim() });
  };

  const handleShare = (solution: SolutionWithUser) => {
    if (solution.id) {
      const shareUrl = `${window.location.origin}/solution/${solution.id}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Solution link copied to clipboard.",
      });
    }
  };

  const getDisplayName = (user: SolutionWithUser['user']) => {
    if (!user) return "Anonymous";
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.username;
  };

  const getChallengeDisplayName = (challenge: string) => {
    return challenge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const sortedSolutions = [...solutions].sort((a, b) => {
    if (filter === 'top_rated') {
      return b.synergyScore - a.synergyScore;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="py-20 bg-gradient-to-br from-soft-white to-sky-blue/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-quicksand font-bold text-4xl text-earth-green mb-4">Community Hub</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with global thinkers, share solutions, and collaborate on building a sustainable future together.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Community Stats */}
          <div className="space-y-6">
            <Card className="shadow-lg border-earth-green/10">
              <CardHeader>
                <CardTitle className="font-quicksand text-xl text-earth-green">Community Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-earth-green/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-earth-green" />
                    </div>
                    <span className="font-medium">Active Members</span>
                  </div>
                  <span className="text-xl font-bold text-earth-green">15,247</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-sky-blue/10 rounded-full flex items-center justify-center">
                      💡
                    </div>
                    <span className="font-medium">Solutions Shared</span>
                  </div>
                  <span className="text-xl font-bold text-sky-blue">{solutions.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-sandstone/10 rounded-full flex items-center justify-center">
                      🏆
                    </div>
                    <span className="font-medium">Top Solutions</span>
                  </div>
                  <span className="text-xl font-bold text-sandstone">
                    {solutions.filter(s => s.synergyScore > 80).length}
                  </span>
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-earth-green/10 to-sky-blue/10 rounded-xl">
                  <div className="text-sm font-medium text-earth-green mb-1">🌱 This Week</div>
                  <div className="text-sm text-gray-600">
                    {solutions.filter(s => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(s.createdAt) > weekAgo;
                    }).length} new climate solutions proposed
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Features */}
            <div className="space-y-4">
              <Card className="shadow-lg border-earth-green/10">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-earth-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    💬
                  </div>
                  <h3 className="font-quicksand font-semibold text-lg text-earth-green mb-2">Discussion Forums</h3>
                  <p className="text-gray-600 text-sm">Engage in meaningful conversations about global challenges and solutions</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-earth-green/10">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-sky-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    🤝
                  </div>
                  <h3 className="font-quicksand font-semibold text-lg text-sky-blue mb-2">Collaboration Hub</h3>
                  <p className="text-gray-600 text-sm">Team up with like-minded individuals to develop comprehensive solutions</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-earth-green/10">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-sandstone/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    🏅
                  </div>
                  <h3 className="font-quicksand font-semibold text-lg text-sandstone mb-2">Recognition System</h3>
                  <p className="text-gray-600 text-sm">Earn badges and climb leaderboards for your contributions to sustainability</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Solutions Feed */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-earth-green/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-quicksand text-xl text-earth-green">Recent Solutions</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant={filter === 'latest' ? 'default' : 'outline'}
                      size="sm"
                      className={filter === 'latest' 
                        ? 'bg-earth-green text-white' 
                        : 'border-gray-300 text-gray-600 hover:border-earth-green'
                      }
                      onClick={() => setFilter('latest')}
                    >
                      Latest
                    </Button>
                    <Button
                      variant={filter === 'top_rated' ? 'default' : 'outline'}
                      size="sm"
                      className={filter === 'top_rated' 
                        ? 'bg-earth-green text-white' 
                        : 'border-gray-300 text-gray-600 hover:border-earth-green'
                      }
                      onClick={() => setFilter('top_rated')}
                    >
                      Top Rated
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="loading-spinner w-8 h-8"></div>
                  </div>
                ) : solutions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Solutions Yet</h3>
                    <p className="text-gray-500">Be the first to share a solution with the community!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sortedSolutions.slice(0, 10).map((solution) => (
                      <div key={solution.id} className="border border-gray-200 rounded-2xl p-6 hover:border-earth-green/30 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-earth-green to-forest-green rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {solution.user?.firstName?.charAt(0) || solution.user?.username?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{getDisplayName(solution.user)}</div>
                              <div className="text-sm text-gray-600">@{solution.user?.username || 'anonymous'}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-earth-green">{Math.round(solution.synergyScore)}%</div>
                            <div className="text-xs text-gray-600">Synergy Score</div>
                          </div>
                        </div>

                        <h4 className="font-medium text-gray-800 mb-2">{solution.title}</h4>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{solution.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <Badge variant="secondary" className="text-xs">
                              {getChallengeDisplayName(solution.challenge)}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(solution.createdAt))} ago
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center space-x-1 text-gray-600 hover:text-earth-green"
                              onClick={() => handleLike(solution.id)}
                              disabled={likeMutation.isPending}
                            >
                              <Heart className="w-4 h-4" />
                              <span>{solution.likesCount || 0}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center space-x-1 text-gray-600 hover:text-sky-blue"
                              onClick={() => setSelectedSolution(solution)}
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>{solution.commentsCount || 0}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center space-x-1 text-gray-600 hover:text-sandstone"
                              onClick={() => handleShare(solution)}
                            >
                              <Share2 className="w-4 h-4" />
                              <span>Share</span>
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-earth-green hover:text-forest-green"
                            onClick={() => setSelectedSolution(solution)}
                          >
                            View Details →
                          </Button>
                        </div>
                      </div>
                    ))}

                    {solutions.length > 10 && (
                      <div className="text-center pt-4">
                        <Button 
                          variant="outline" 
                          className="border-earth-green text-earth-green hover:bg-earth-green hover:text-white"
                        >
                          Load More Solutions
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Solution Detail Modal */}
        {selectedSolution && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-quicksand text-xl text-earth-green">
                    {selectedSolution.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSolution(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-earth-green to-forest-green rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {selectedSolution.user?.firstName?.charAt(0) || selectedSolution.user?.username?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{getDisplayName(selectedSolution.user)}</div>
                    <div className="text-sm text-gray-600">@{selectedSolution.user?.username || 'anonymous'}</div>
                  </div>
                </div>

                <p className="text-gray-700">{selectedSolution.description}</p>

                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">
                    {getChallengeDisplayName(selectedSolution.challenge)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(selectedSolution.createdAt))} ago
                  </span>
                  <div className="text-lg font-bold text-earth-green">
                    {Math.round(selectedSolution.synergyScore)}% Synergy
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t pt-6">
                  <h3 className="font-medium text-gray-800 mb-4">Comments</h3>
                  
                  {user && (
                    <div className="mb-6">
                      <Textarea
                        placeholder="Share your thoughts on this solution..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        className="mb-3"
                      />
                      <Button
                        onClick={() => handleComment(selectedSolution.id)}
                        disabled={!newComment.trim() || commentMutation.isPending}
                        className="bg-earth-green text-white hover:bg-forest-green"
                      >
                        {commentMutation.isPending ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {selectedSolution.comments && selectedSolution.comments.length > 0 ? (
                      selectedSolution.comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-sky-blue to-ocean-blue rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {comment.user?.firstName?.charAt(0) || comment.user?.username?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{getDisplayName(comment.user)}</span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(comment.createdAt))} ago
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
