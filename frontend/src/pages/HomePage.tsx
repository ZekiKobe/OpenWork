import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { Post } from '../types/index';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, User, Tag, TrendingUp, Star, Award, BookOpen, Zap, Users, Search, Filter, ChevronRight, Crown, Trophy, Target, Facebook, Twitter, Linkedin, Github, Mail, Phone, MapPin, Shield, ChevronLeft, Code, CheckCircle, BarChart3, Briefcase, Plus, ArrowRight, Clock, DollarSign, Lock, Globe, Sparkles, PenTool, Palette, Camera, Music, Video, FileText, ShoppingCart, Smartphone, Monitor, Database, Cloud } from 'lucide-react';
import { ScrollReveal, StaggerContainer } from '../components/common/ScrollReveal';
import { motion } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';

export const HomePage: React.FC = () => {
  usePageTitle('Home');
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Image slider state
  const [currentImageSlide, setCurrentImageSlide] = useState(0);
  const [isImageAutoPlaying, setIsImageAutoPlaying] = useState(true);

  const categories = [
    { id: 'all', name: 'All Posts', icon: BookOpen },
    { id: 'javascript', name: 'JavaScript', icon: Zap },
    { id: 'react', name: 'React', icon: Target },
    { id: 'web-development', name: 'Web Dev', icon: Crown },
    { id: 'tutorial', name: 'Tutorials', icon: Award },
  ];

  // Popular service categories (Fiverr-style)
  const serviceCategories = [
    { name: 'Web Development', icon: Code, color: 'from-blue-500 to-blue-600', count: '2.5K+' },
    { name: 'Graphic Design', icon: Palette, color: 'from-purple-500 to-purple-600', count: '1.8K+' },
    { name: 'Digital Marketing', icon: TrendingUp, color: 'from-green-500 to-green-600', count: '1.2K+' },
    { name: 'Writing & Translation', icon: PenTool, color: 'from-orange-500 to-orange-600', count: '950+' },
    { name: 'Video & Animation', icon: Video, color: 'from-red-500 to-red-600', count: '800+' },
    { name: 'Music & Audio', icon: Music, color: 'from-pink-500 to-pink-600', count: '650+' },
    { name: 'Photography', icon: Camera, color: 'from-indigo-500 to-indigo-600', count: '520+' },
    { name: 'Mobile Apps', icon: Smartphone, color: 'from-cyan-500 to-cyan-600', count: '480+' },
    { name: 'Data Entry', icon: Database, color: 'from-teal-500 to-teal-600', count: '420+' },
  ];

  // Image slider data - Freelance/Client focused
  const imageSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
      title: "Find Your Perfect Match",
      subtitle: "Connect with skilled freelancers who deliver results"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
      title: "Launch Your Freelance Career",
      subtitle: "Turn your skills into a thriving business"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=400&fit=crop",
      title: "Get Projects Done Right",
      subtitle: "Hire verified professionals with proven track records"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop",
      title: "Scale Your Business",
      subtitle: "Access global talent for your growing projects"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
      title: "Build Long-term Partnerships",
      subtitle: "Create lasting relationships with reliable freelancers"
    }
  ];

  // Image slider auto-rotation
  useEffect(() => {
    if (!isImageAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentImageSlide((prev) => (prev + 1) % imageSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isImageAutoPlaying, imageSlides.length]);

  // Image slider navigation functions
  const goToNextImageSlide = () => {
    setCurrentImageSlide((prev) => (prev + 1) % imageSlides.length);
  };

  const goToPrevImageSlide = () => {
    setCurrentImageSlide((prev) => (prev - 1 + imageSlides.length) % imageSlides.length);
  };

  useEffect(() => {
    loadPosts();
    loadFeaturedPosts();
  }, [page, selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const tag = selectedCategory !== 'all' ? selectedCategory : undefined;
      const response = await apiService.getPosts(page, 12, tag);
      if (page === 1) {
        setPosts(response.data);
      } else {
        setPosts(prev => [...prev, ...response.data]);
      }
      setHasMore(page < response.totalPages);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedPosts = async () => {
    try {
      const response = await apiService.getPosts(1, 3);
      setFeaturedPosts(response.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to load featured posts:', error);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleToggleLike = async (postId: number, index: number) => {
    if (!user) return;

    try {
      const result = await apiService.toggleLike(postId);
      setPosts(prev => prev.map((post, i) =>
        i === index
          ? { ...post, user_like: result.liked, stats: { ...post.stats, likes_count: result.likes_count } }
          : post
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <ScrollReveal direction="right">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Built for freelancers and clients
                </motion.div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Find the Perfect{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                    Freelancer
                  </span>
                  <br />
                  for Your Project
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Connect with skilled professionals, get your projects done on time, and build your business with confidence. Join thousands of successful freelancers and clients.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  {!user ? (
                    <>
                      <Link to="/register" className="no-underline">
                        <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                          Get Started Free
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                      <Link to="/login" className="no-underline">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  ) : user.role === 'freelancer' ? (
                    <>
                      <Link to="/jobs" className="no-underline">
                        <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                          Browse Jobs
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                      <Link to="/marketplace/create-gig" className="no-underline">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2">
                          Create Gig
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/jobs/create" className="no-underline">
                        <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                          Post a Job
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                      <Link to="/talent" className="no-underline">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2">
                          Find Talent
                        </Button>
                      </Link>
                    </>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>Secure payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-600" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Visual */}
            <ScrollReveal direction="left" delay={0.2}>
              <div className="relative">
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">JD</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">John Doe</div>
                          <div className="text-sm text-gray-600">Full Stack Developer</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">$50/hr</div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>4.9</span>
                          <span className="text-gray-400">(120)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">SM</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Sarah Miller</div>
                          <div className="text-sm text-gray-600">UI/UX Designer</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">$45/hr</div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>4.8</span>
                          <span className="text-gray-400">(95)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">AR</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Alex Rodriguez</div>
                          <div className="text-sm text-gray-600">Data Scientist</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">$60/hr</div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>5.0</span>
                          <span className="text-gray-400">(150)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg border border-gray-100"
                >
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg border border-gray-100"
                >
                  <Award className="w-6 h-6 text-green-500" />
                </motion.div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ScrollReveal>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">10K+</div>
                <div className="text-gray-600">Active Members</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">50K+</div>
                <div className="text-gray-600">Projects Completed</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">$1M+</div>
                <div className="text-gray-600">Total Earnings</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">4.9/5</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </ScrollReveal>
          </StaggerContainer>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Categories</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explore services across different categories and find the perfect match for your needs.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {serviceCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <ScrollReveal key={category.name} delay={index * 0.05}>
                  <Link to="/browse-gigs" className="no-underline">
                    <Card className="p-6 border-0 shadow-md hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer group">
                      <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">{category.count} services</p>
                    </Card>
                  </Link>
                </ScrollReveal>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Freelance Success Stories - Image Slider Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Freelance Success Stories</h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                See how freelancers and clients achieve their goals through our marketplace
              </p>
            </div>
          </ScrollReveal>

          {/* Image Slider */}
          <div className="relative max-w-5xl mx-auto">
            <div
              className="relative overflow-hidden rounded-2xl shadow-2xl"
              onMouseEnter={() => setIsImageAutoPlaying(false)}
              onMouseLeave={() => setIsImageAutoPlaying(true)}
            >
              {/* Navigation Arrows */}
              <button
                onClick={goToPrevImageSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={goToNextImageSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Slides */}
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentImageSlide * 100}%)` }}
              >
                {imageSlides.map((slide, index) => (
                  <div key={slide.id} className="flex-shrink-0 w-full relative">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-80 md:h-96 object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl"></div>

                    {/* Content */}
                    <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 right-4 sm:right-6 md:right-8 text-white">
                      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{slide.title}</h3>
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90">{slide.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3">
                {imageSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageSlide
                        ? 'bg-white scale-125 shadow-lg'
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>

              {/* Slide Counter */}
              <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentImageSlide + 1} / {imageSlides.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex justify-center space-x-2 mt-6 overflow-x-auto pb-2">
              {imageSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentImageSlide(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    index === currentImageSlide
                      ? 'border-white shadow-lg scale-110'
                      : 'border-transparent opacity-60 hover:opacity-80'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Carousel Text Content */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <ScrollReveal>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">For Clients</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Find skilled freelancers, get projects done on time, and build your business with confidence.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">For Freelancers</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Showcase your skills, find great projects, and earn what you're worth in a supportive community.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Why Choose Us</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Secure payments, verified reviews, dispute resolution, and tools to help you succeed.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {/* Call-to-Action Section */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
                  Join thousands of successful freelancers and clients who trust our platform to connect, collaborate, and grow their businesses.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {user?.role === 'client' ? (
                    <>
                      <Link to="/jobs">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                          <Search className="w-5 h-5 mr-2" />
                          Browse Freelancers
                        </Button>
                      </Link>
                      <Link to="/jobs/create">
                        <Button size="lg" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                          <Plus className="w-5 h-5 mr-2" />
                          Post a Job
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/jobs">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                          <Search className="w-5 h-5 mr-2" />
                          Find Jobs
                        </Button>
                      </Link>
                      <Link to="/marketplace/create-gig">
                        <Button size="lg" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                          <Plus className="w-5 h-5 mr-2" />
                          Create Gig
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get started in three simple steps. Whether you're a client or freelancer, we make it easy.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <ScrollReveal>
              <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Your Profile</h3>
                <p className="text-gray-600">
                  Sign up and create your profile. Add your skills, portfolio, and experience to stand out.
                </p>
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Browse & Connect</h3>
                <p className="text-gray-600">
                  Browse jobs or services, filter by skills and budget, and connect with the perfect match.
                </p>
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Work Done</h3>
                <p className="text-gray-600">
                  Collaborate, communicate, and complete projects. Secure payments ensure everyone is protected.
                </p>
              </Card>
            </ScrollReveal>
          </StaggerContainer>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We provide everything you need to succeed in the freelance marketplace.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScrollReveal>
              <Card className="p-6 border-0 shadow-lg bg-white">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payments</h3>
                <p className="text-gray-600">
                  Your payments are protected with our secure escrow system.
                </p>
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <Card className="p-6 border-0 shadow-lg bg-white">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Professionals</h3>
                <p className="text-gray-600">
                  All freelancers are verified and background-checked.
                </p>
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <Card className="p-6 border-0 shadow-lg bg-white">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Support</h3>
                <p className="text-gray-600">
                  Get help whenever you need it with our round-the-clock support.
                </p>
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <Card className="p-6 border-0 shadow-lg bg-white">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fair Pricing</h3>
                <p className="text-gray-600">
                  Transparent pricing with no hidden fees or charges.
                </p>
              </Card>
            </ScrollReveal>
          </StaggerContainer>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Real stories from freelancers and clients who found success on our platform.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal>
              <Card className="p-8 border-0 shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "This platform changed my freelance career. I've found amazing clients and doubled my income in just 6 months!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">JD</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">John Doe</div>
                    <div className="text-sm text-gray-600">Freelancer</div>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <Card className="p-8 border-0 shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "As a business owner, finding quality freelancers was always a challenge. This platform made it so easy to find the right talent."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">SM</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Miller</div>
                    <div className="text-sm text-gray-600">Client</div>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <Card className="p-8 border-0 shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "The best freelance platform I've used. Great UI, secure payments, and an amazing community of professionals."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">AR</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Alex Rodriguez</div>
                    <div className="text-sm text-gray-600">Freelancer</div>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          </StaggerContainer>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Insights</h2>
                  <p className="text-gray-600">Top-rated contributions from our community</p>
                </div>
                <Link to="/posts" className="text-green-600 hover:text-green-700 font-medium flex items-center">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <ScrollReveal key={post.id} delay={index * 0.1}>
                  <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Star className="w-12 h-12 mx-auto mb-2 opacity-80" />
                        <div className="text-sm font-medium">Featured Post</div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <Link to={`/posts/${post.id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-gray-700">{post.author.username}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-500">
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {post.stats.likes_count}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* Posts Feed */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Topics</h2>
              <div className="flex flex-wrap gap-3 mb-8">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setPage(1);
                      }}
                      className={`flex items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                          : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'Latest Posts' : `${categories.find(c => c.id === selectedCategory)?.name} Posts`}
            </h3>
            <div className="flex items-center space-x-2 text-gray-600">
              <Filter className="w-4 h-4" />
              <span className="text-sm">{posts.length} posts</span>
            </div>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <ScrollReveal key={post.id} delay={index * 0.05}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/users/${post.author.username}`}
                          className="font-medium text-gray-900 hover:text-green-600 truncate block"
                        >
                          {post.author.username}
                        </Link>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            post.expertise_level === 'beginner' ? 'bg-green-100 text-green-700' :
                            post.expertise_level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                            post.expertise_level === 'advanced' ? 'bg-purple-100 text-purple-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {post.expertise_level}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link to={`/posts/${post.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2 leading-tight">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                      {post.content.length > 150
                        ? `${post.content.substring(0, 150)}...`
                        : post.content
                      }
                    </p>

                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-100"
                          >
                            <Tag className="w-2.5 h-2.5 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleToggleLike(post.id, index)}
                          disabled={!user}
                          className={`flex items-center space-x-1 text-sm transition-colors ${
                            post.user_like
                              ? 'text-red-600 hover:text-red-700'
                              : 'text-gray-600 hover:text-gray-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <Heart className={`w-4 h-4 ${post.user_like ? 'fill-current' : ''}`} />
                          <span>{post.stats.likes_count}</span>
                        </button>

                        <Link
                          to={`/posts/${post.id}#comments`}
                          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.stats.comments_count}</span>
                        </Link>
                      </div>

                      <Link to={`/posts/${post.id}`}>
                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </StaggerContainer>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading amazing content...</p>
            </div>
          )}

          {!loading && hasMore && (
            <div className="text-center py-12">
              <Button onClick={handleLoadMore} variant="outline" size="lg" className="shadow-md hover:shadow-lg">
                Load More Insights
              </Button>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {selectedCategory === 'all' ? 'No posts yet' : `No ${selectedCategory} posts found`}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {selectedCategory === 'all'
                    ? 'Be the first to share your knowledge and start building our community!'
                    : `Be the first to share insights about ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()}!`
                  }
                </p>
                {user && (
                  <Link to="/create-post">
                    <Button size="lg" className="shadow-md hover:shadow-lg">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Create First Post
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VL</span>
                </div>
                <span className="text-xl font-bold">OpenWork</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                A quality-driven community focused on rewarding valuable contributions.
                Share knowledge, earn points, and grow together.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/rules" className="text-gray-300 hover:text-white transition-colors">
                    Community Guidelines
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Points System
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Community</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Browse Posts
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Popular Topics
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Recent Activity
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Success Stories
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Report Content
                  </a>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 OpenWork. All rights reserved. Built with ❤️ for the developer community.
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
