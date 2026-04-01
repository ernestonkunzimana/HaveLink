'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Users,
  TrendingUp,
  Globe,
  BarChart3,
  Target,
  Award,
  MapPin,
  Download,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed'];

const genderData = [
  { name: 'Female Farmers', value: 58 },
  { name: 'Male Farmers', value: 42 },
];

const incomeData = [
  { month: 'Sep', avgIncome: 45000, baseline: 35000 },
  { month: 'Oct', avgIncome: 48000, baseline: 35000 },
  { month: 'Nov', avgIncome: 52000, baseline: 35000 },
  { month: 'Dec', avgIncome: 68000, baseline: 35000 },
  { month: 'Jan', avgIncome: 55000, baseline: 35000 },
  { month: 'Feb', avgIncome: 61000, baseline: 35000 },
];

const cooperativeImpact = [
  { name: 'Musanze Coop', farmers: 320, avgIncome: 65000, marketAccess: 92 },
  { name: 'Nyabihu Organic', farmers: 185, avgIncome: 72000, marketAccess: 88 },
  { name: 'Burera Grains', farmers: 240, avgIncome: 58000, marketAccess: 79 },
  { name: 'Rulindo Coffee', farmers: 156, avgIncome: 94000, marketAccess: 95 },
  { name: 'Gicumbi Union', farmers: 410, avgIncome: 52000, marketAccess: 74 },
];

const regionData = [
  { region: 'Northern', coops: 12, farmers: 1800, volume: 85000 },
  { region: 'Western', coops: 9, farmers: 1200, volume: 62000 },
  { region: 'Southern', coops: 15, farmers: 2100, volume: 98000 },
  { region: 'Eastern', coops: 7, farmers: 950, volume: 45000 },
  { region: 'Kigali', coops: 5, farmers: 320, volume: 18000 },
];

export default function NGODashboard() {
  const { user } = useAuth();

  const totalFarmers = cooperativeImpact.reduce((s, c) => s + c.farmers, 0);
  const avgMarketAccess = cooperativeImpact.reduce((s, c) => s + c.marketAccess, 0) / cooperativeImpact.length;
  const avgIncome = cooperativeImpact.reduce((s, c) => s + c.avgIncome, 0) / cooperativeImpact.length;
  const incomeGrowth = ((61000 - 35000) / 35000 * 100).toFixed(1);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-8 h-8 text-pink-600" />
                NGO / Donor Impact Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Track farmer income, market access, gender inclusion, and cooperative performance.
              </p>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Impact Report
            </Button>
          </div>

          {/* Key Impact Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Farmers Reached', value: totalFarmers.toLocaleString(), change: '+12% vs last quarter', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
              { title: 'Avg Income Growth', value: `+${incomeGrowth}%`, change: 'vs pre-project baseline', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Market Access Rate', value: `${avgMarketAccess.toFixed(1)}%`, change: 'Farmers with digital market access', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50' },
              { title: 'Female Participation', value: '58%', change: '+5% since project start', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
            ].map((stat, i) => (
              <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Income Trend */}
            <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-pink-600" />
                    Average Farmer Income vs Baseline (RWF/month)
                  </CardTitle>
                  <CardDescription>Monthly average income compared to pre-project baseline</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={incomeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} RWF`]} />
                      <Legend />
                      <Line type="monotone" dataKey="avgIncome" stroke="#db2777" strokeWidth={2} name="Avg Income" />
                      <Line type="monotone" dataKey="baseline" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" name="Baseline" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Gender Breakdown */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    Gender Inclusion
                  </CardTitle>
                  <CardDescription>Farmer participation by gender</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={genderData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${value}%`}>
                        {genderData.map((_, i) => <Cell key={i} fill={i === 0 ? '#db2777' : '#2563eb'} />)}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(v) => [`${v}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 p-3 bg-pink-50 rounded-lg">
                    <p className="text-sm text-pink-800 font-medium">🎯 Target: 60% female participation by end of project</p>
                    <Progress value={58} max={60} className="h-2 mt-2" />
                    <p className="text-xs text-pink-600 mt-1">58% achieved — 2% to target</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Cooperative Performance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-pink-600" />
                  Cooperative Performance
                </CardTitle>
                <CardDescription>
                  Key metrics per supported cooperative — member count, income, and digital market access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cooperativeImpact.map((coop, i) => (
                    <motion.div
                      key={coop.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                            {coop.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{coop.name}</p>
                            <p className="text-xs text-gray-500">{coop.farmers} members</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-700">{coop.avgIncome.toLocaleString()} RWF/mo</p>
                          <p className="text-xs text-gray-500">avg income</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Digital Market Access</span>
                          <span className="font-medium">{coop.marketAccess}%</span>
                        </div>
                        <Progress value={coop.marketAccess} className="h-2" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Regional Coverage */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-pink-600" />
                  Regional Coverage
                </CardTitle>
                <CardDescription>
                  Geographic distribution of supported cooperatives and farmers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {regionData.map((r, i) => (
                    <div key={r.region} className="text-center p-4 bg-gray-50 rounded-lg border">
                      <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                        {r.region.charAt(0)}
                      </div>
                      <p className="font-semibold text-sm">{r.region}</p>
                      <p className="text-xs text-gray-600 mt-1">{r.coops} cooperatives</p>
                      <p className="text-xs text-gray-600">{r.farmers.toLocaleString()} farmers</p>
                      <p className="text-xs text-green-600 font-medium mt-1">{(r.volume / 1000).toFixed(0)}t traded</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SDG Alignment */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-pink-600" />
                  SDG Alignment & Impact Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { sdg: 'SDG 1', title: 'No Poverty', metric: '+74%', detail: 'farmer income above poverty line', color: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-800' },
                    { sdg: 'SDG 2', title: 'Zero Hunger', metric: '98%', detail: 'cooperatives with food security', color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' },
                    { sdg: 'SDG 5', title: 'Gender Equality', metric: '58%', detail: 'female farmer participation', color: 'bg-pink-50 border-pink-200', badge: 'bg-pink-100 text-pink-800' },
                    { sdg: 'SDG 8', title: 'Decent Work', metric: '1,311', detail: 'farmers with fair market access', color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-800' },
                    { sdg: 'SDG 10', title: 'Reduced Inequality', metric: '-23%', detail: 'reduction in price disparity', color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-800' },
                    { sdg: 'SDG 17', title: 'Partnerships', metric: '48', detail: 'active cooperative partnerships', color: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-800' },
                  ].map(item => (
                    <div key={item.sdg} className={`p-4 rounded-lg border ${item.color}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={item.badge}>{item.sdg}</Badge>
                        <span className="font-medium text-sm">{item.title}</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{item.metric}</div>
                      <p className="text-xs text-gray-600 mt-1">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
