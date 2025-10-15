import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Code2, Brain, Trophy, Users, Zap, Target, ArrowRight, Play, 
  CheckCircle, Star, BookOpen, Award, TrendingUp, Globe,
  MessageCircle, Github, Twitter, Linkedin, Mail, Phone,
  Cpu, Database, Cloud, Shield, Rocket, Heart, Coffee,
  BarChart3, PieChart, LineChart, Activity, Layers,
  Smartphone, Monitor, Tablet, Clock, Calendar, MapPin
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

const SimplifiedProfessionalHome = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [stats, setStats] = useState({ users: 50000, problems: 15000, companies: 500, success: 95 });
  const { user } = useAuth();
  const navigate = useNavigate();

  // Define data arrays
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      content: "LearnToCode's AI-powered approach helped me land my dream job at Google. The personalized learning path was exactly what I needed.",
      rating: 5,
      company: "Google"
    },
    {
      name: "Alex Rodriguez", 
      role: "Full Stack Developer at Amazon",
      content: "The interactive coding environment and real-time feedback made learning algorithms so much easier. Highly recommend!",
      rating: 5,
      company: "Amazon"
    },
    {
      name: "Maria Patel",
      role: "Data Scientist at Microsoft", 
      content: "From beginner to Microsoft in 6 months! The adaptive learning system knew exactly what I needed to improve.",
      rating: 5,
      company: "Microsoft"
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized learning paths adapted to your skill level and learning speed",
      color: "from-purple-500 to-blue-600",
      stats: "98% Accuracy"
    },
    {
      icon: Code2,
      title: "Interactive Coding",
      description: "Practice with real-world problems in multiple programming languages",
      color: "from-blue-500 to-cyan-600", 
      stats: "15+ Languages"
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Gamified learning with badges, streaks, and competitive leaderboards",
      color: "from-yellow-500 to-orange-600",
      stats: "50+ Badges"
    }
  ];

  const companies = [
    { name: "Google", logo: "🔍" },
    { name: "Amazon", logo: "📦" },
    { name: "Microsoft", logo: "🪟" },
    { name: "Apple", logo: "🍎" },
    { name: "Meta", logo: "📘" },
    { name: "Netflix", logo: "🎬" }
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Code2 className="h-8 w-8 mr-3 text-black" />
              <span className="text-2xl font-bold text-black">LearnToCode</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/practice" className="text-gray-700 hover:text-black transition-colors">Practice</Link>
              <Link to="/problems-demo" className="text-gray-700 hover:text-black transition-colors">Problems</Link>
              <div className="relative group">
                <span className="text-gray-700 hover:text-black transition-colors cursor-pointer">Quiz ▼</span>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/programming-quiz-demo" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">Programming Quiz</Link>
                  <Link to="/competitive-quiz-demo" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">Competitive Quiz</Link>
                </div>
              </div>
              {user ? (
                <Link to="/dashboard" className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-black transition-colors">Login</Link>
                  <Link to="/register" className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gray-50"></div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-black">
            Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-black">
              Programming
            </span> with AI
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Transform your coding skills with our intelligent learning platform. 
            Personalized paths, real-time feedback, and industry-leading mentorship.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link
              to="/practice"
              className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 inline-flex items-center justify-center"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Learning Free
            </Link>
            <Link
              to="/problems-demo"
              className="bg-transparent border-2 border-black hover:bg-black hover:text-white text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 inline-flex items-center justify-center"
            >
              <Code2 className="mr-2 h-5 w-5" />
              Explore Problems
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">{stats.users.toLocaleString()}+</div>
              <div className="text-gray-600">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">{stats.problems.toLocaleString()}+</div>
              <div className="text-gray-600">Coding Problems</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">{stats.companies}+</div>
              <div className="text-gray-600">Partner Companies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">{stats.success}%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Why Choose LearnToCode?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of programming education with our cutting-edge platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black">{feature.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                <div className="text-sm font-semibold text-gray-800">{feature.stats}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">
              Trusted by developers at leading companies
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
              {companies.map((company, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-2">{company.logo}</div>
                  <div className="text-sm text-gray-600">{company.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Success Stories</h2>
            <p className="text-xl text-gray-600">
              Hear from developers who transformed their careers with LearnToCode
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-lg">
            <div className="mb-6">
              <p className="text-lg leading-relaxed mb-6 text-gray-800">"{testimonials[activeTestimonial].content}"</p>
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gray-800 fill-current" />
                ))}
              </div>
              <div className="font-semibold text-lg text-black">{testimonials[activeTestimonial].name}</div>
              <div className="text-gray-600">{testimonials[activeTestimonial].role}</div>
            </div>

            <div className="flex justify-center space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === activeTestimonial ? 'bg-black' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of developers who are already learning with AI-powered guidance
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/register"
              className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              to="/quiz-demo"
              className="bg-transparent border-2 border-black hover:bg-black hover:text-white text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105"
            >
              Take Assessment
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Code2 className="h-8 w-8 mr-3 text-white" />
                <span className="text-xl font-bold text-white">LearnToCode</span>
              </div>
              <p className="text-gray-300">
                Empowering developers with AI-driven learning experiences.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Platform</h4>
              <div className="space-y-2">
                <Link to="/practice" className="block text-gray-300 hover:text-white transition-colors">Practice</Link>
                <Link to="/problems-demo" className="block text-gray-300 hover:text-white transition-colors">Problems</Link>
                <Link to="/programming-quiz-demo" className="block text-gray-300 hover:text-white transition-colors">Programming Quiz</Link>
                <Link to="/competitive-quiz-demo" className="block text-gray-300 hover:text-white transition-colors">Competitive Quiz</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">About</a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">Careers</a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 LearnToCode. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimplifiedProfessionalHome;