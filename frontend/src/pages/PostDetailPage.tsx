import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { Post, Comment } from '../types/index';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Heart, MessageCircle, User, Tag, ArrowLeft, Flag, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPostAndComments();
    }
  }, [id]);

  const loadPostAndComments = async () => {
    try {
      setLoading(true);
      const [postResponse, commentsResponse] = await Promise.all([
        apiService.getPost(parseInt(id!)),
        apiService.getPostComments(parseInt(id!))
      ]);

      setPost(postResponse);
      setComments(commentsResponse);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!user || !post) return;

    try {
      const result = await apiService.toggleLike(post.id);
      setPost(prev => prev ? {
        ...prev,
        user_like: result.liked,
        stats: { ...prev.stats, likes_count: result.likes_count }
      } : null);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      setCommentLoading(true);
      const commentData = {
        content: newComment.trim(),
        ...(parentId && { parent_id: parentId })
      };

      const newCommentObj = await apiService.createComment(post!.id, commentData);

      if (parentId) {
        // Add as reply to existing comment
        setComments(prev => prev.map(comment =>
          comment.id === parentId
            ? { ...comment, replies: [...(comment.replies || []), newCommentObj] }
            : comment
        ));
      } else {
        // Add as top-level comment
        setComments(prev => [...prev, newCommentObj]);
      }

      setNewComment('');
      setReplyTo(null);
    } catch (error: any) {
      console.error('Failed to add comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : 'mb-4'}`}>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-primary-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Link
              to={`/users/${comment.author.username}`}
              className="font-medium text-secondary-900 hover:text-primary-600"
            >
              {comment.author.username}
            </Link>
            <span className="text-sm text-secondary-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>

          <p className="text-secondary-700 mb-2 whitespace-pre-wrap">{comment.content}</p>

          {user && !isReply && (
            <div className="flex items-center space-x-4 text-sm">
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="text-secondary-600 hover:text-secondary-700 flex items-center space-x-1"
              >
                <MessageCircle className="w-3 h-3" />
                <span>Reply</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reply form */}
      {replyTo === comment.id && user && (
        <form onSubmit={(e) => handleSubmitComment(e, comment.id)} className="mt-3 ml-11">
          <div className="flex space-x-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Reply to ${comment.author.username}...`}
              className="flex-1"
            />
            <Button type="submit" size="sm" loading={commentLoading}>
              Reply
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setReplyTo(null);
                setNewComment('');
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Render replies */}
      {comment.replies && comment.replies.map(reply => renderComment(reply, true))}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mt-8"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              {error || 'Post not found'}
            </h2>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-secondary-600 hover:text-secondary-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Posts
        </Link>
      </div>

      {/* Post content */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <Link
                  to={`/users/${post.author.username}`}
                  className="font-medium text-secondary-900 hover:text-primary-600"
                >
                  {post.author.username}
                </Link>
                <p className="text-sm text-secondary-500">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">
            {post.title}
          </h1>

          <div className="prose prose-lg max-w-none mb-6">
            <p className="whitespace-pre-wrap text-secondary-700 leading-relaxed">
              {post.content}
            </p>
          </div>

          {/* Tags */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                >
                  <Tag className="w-4 h-4 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-secondary-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleToggleLike}
                disabled={!user}
                className={`flex items-center space-x-2 text-sm ${
                  post.user_like
                    ? 'text-danger-600 hover:text-danger-700'
                    : 'text-secondary-600 hover:text-secondary-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Heart className={`w-5 h-5 ${post.user_like ? 'fill-current' : ''}`} />
                <span>{post.stats.likes_count}</span>
              </button>

              <div className="flex items-center space-x-2 text-sm text-secondary-600">
                <MessageCircle className="w-5 h-5" />
                <span>{post.stats.comments_count}</span>
              </div>
            </div>

            {user && (
              <div className="flex items-center space-x-2">
                <button className="p-2 text-secondary-600 hover:text-secondary-700 rounded-lg hover:bg-secondary-50">
                  <Flag className="w-4 h-4" />
                </button>
                <button className="p-2 text-secondary-600 hover:text-secondary-700 rounded-lg hover:bg-secondary-50">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments section */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-secondary-900">
            Comments ({comments.length})
          </h2>
        </CardHeader>

        <CardContent>
          {/* Add comment form */}
          {user ? (
            <form onSubmit={(e) => handleSubmitComment(e)} className="mb-6">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={3}
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <Button type="submit" loading={commentLoading}>
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 mb-6 border-b border-secondary-200">
              <p className="text-secondary-600 mb-4">
                Join the conversation! Sign in to add comments.
              </p>
              <Link to="/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                <p className="text-secondary-600">No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map(comment => renderComment(comment))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
