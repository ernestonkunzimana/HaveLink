'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Shield, 
  Users, 
  BarChart, 
  Globe, 
  Smartphone, 
  Wifi, 
  Award,
  CheckCircle2,
  Star,
  Wheat,
  Scale,
  Gavel,
  DollarSign,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DEFAULT_DASHBOARD_ROUTE = '/dashboard/buyer';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRedirects: Record<string, string> = {
        admin: '/dashboard/admin',
        manager: '/dashboard/manager',
        worker: '/dashboard/worker',
        client: '/dashboard/client',
        cooperative: '/dashboard/cooperative',
        buyer: '/dashboard/buyer',
        government: '/dashboard/government',
        ngo: '/dashboard/ngo',
      };
      router.push(roleRedirects[user.role as string] || DEFAULT_DASHBOARD_ROUTE);
    }
  }, [isAuthenticated, user, router]);

  const features = [
    {
      icon: Wheat,
      title: 'Produce Marketplace',
      description: 'List and discover fresh farm produce. Support for instant sales, auctions, and contract arrangements.',
      color: 'text-green-600',
    },
    {
      icon: Scale,
      title: 'Smart Weighing System',
      description: 'IoT-enabled bulk weighing (200kg–3 tons) with automated ticket generation and quality grading.',
      color: 'text-blue-600',
    },
    {
      icon: Gavel,
      title: 'Real-Time Bidding',
      description: 'Competitive bidding for produce with instant notifications and automated escrow protection.',
      color: 'text-purple-600',
    },
    {
      icon: DollarSign,
      title: 'Mobile Money Payments',
      description: 'MTN and Airtel Money integration with escrow logic to protect buyers and sellers.',
      color: 'text-orange-600',
    },
    {
      icon: Shield,
      title: 'Government Compliance',
      description: 'Price floor enforcement, tax reporting, and policy dashboards for MINAGRI and RCA.',
      color: 'text-indigo-600',
    },
    {
      icon: BarChart,
      title: 'Analytics & Traceability',
      description: 'Export-ready market data, seasonal forecasting, and buyer mapping for informed decisions.',
      color: 'text-pink-600',
    },
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description: 'Available in English, Kinyarwanda, French, Swahili, and Luganda for inclusive access.',
      color: 'text-teal-600',
    },
    {
      icon: Smartphone,
      title: 'Offline-First PWA',
      description: 'Works without internet connectivity — essential for rural cooperative environments.',
      color: 'text-red-600',
    },
    {
      icon: Wifi,
      title: 'Real-Time Updates',
      description: 'Live bid notifications, weighing alerts, and payment confirmations via Socket.IO.',
      color: 'text-cyan-600',
    },
  ];

  const benefits = [
    'Real-time produce marketplace for cooperatives',
    'IoT-enabled smart weighing and quality grading',
    'Competitive bidding with escrow payment protection',
    'MTN & Airtel Money integration',
    'Government price floor enforcement',
    'Impact tracking for NGOs and donors',
    'Multi-language for rural inclusivity',
    'Offline-first PWA for remote areas',
  ];

  const stats = [
    { label: 'Cooperatives Onboarded', value: '48+', icon: Users },
    { label: 'Farmers Reached', value: '1,300+', icon: Wheat },
    { label: 'Countries Served', value: '3+', icon: Globe },
    { label: 'Tonnes Traded', value: '248+', icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                <span role="img" aria-label="HarvestLink logo">🌾</span>
              </div>
              <div>
                <span className="font-bold text-xl text-gray-800">HarvestLink</span>
                <span className="text-xs block text-gray-500 -mt-1">by PCS-B-LTD</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/auth/login')}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => router.push('/auth/register')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-green-100 text-green-800 border-green-200">
                🌾 Africa's Agricultural Commerce Platform
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
                HarvestLink
                <span className="text-green-600"> Marketplace</span>
              </h1>
              <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
                Smart agricultural commerce ecosystem for cooperatives, farmers, buyers, and governments.
                IoT weighing, real-time bidding, and mobile money — all in one platform.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                🇷🇼 Built for Rwanda & East Africa • Supports MTN & Airtel Money • Works Offline
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => router.push('/auth/register')}
                  className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700"
                >
                  Join the Marketplace
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => router.push('/auth/login')}
                  className="text-lg px-8 py-6"
                >
                  Sign In
                </Button>
              </div>

              {/* Role Quick Links */}
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                {[
                  { label: '🌾 Cooperative', path: '/dashboard/cooperative' },
                  { label: '🛒 Buyer', path: '/dashboard/buyer' },
                  { label: '🏛️ Government', path: '/dashboard/government' },
                  { label: '❤️ NGO/Donor', path: '/dashboard/ngo' },
                ].map(role => (
                  <Button
                    key={role.label}
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/auth/login')}
                    className="text-sm"
                  >
                    {role.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full opacity-20 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-yellow-200 rounded-full opacity-20 blur-3xl animate-pulse" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Agricultural Commerce
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From IoT weighing to escrow payments, HarvestLink covers the full post-harvest trade lifecycle.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why HarvestLink?
              </h2>
              <p className="text-xl text-gray-600">
                Empowering farmers, streamlining cooperative trade, enabling data-driven decisions
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-lg"
                >
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-800">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Agricultural Trade?
            </h2>
            <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
              Join cooperatives, buyers, and government agencies across East Africa 
              using HarvestLink to digitize post-harvest commerce.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => router.push('/auth/register')}
                className="text-lg px-8 py-6"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => router.push('/auth/login')}
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-green-700"
              >
                Sign In Now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                <span role="img" aria-label="HarvestLink logo">🌾</span>
              </div>
              <div>
                <span className="font-bold text-xl">HarvestLink</span>
                <span className="text-xs block text-gray-400 -mt-1">by PCS-B-LTD</span>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Smart Agricultural Commerce Ecosystem for Africa
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">API Docs</a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-400">
              © 2024 PCS-B-LTD / HarvestLink. All rights reserved. Built for Rwanda & East Africa.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}