'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  FileText,
  MapPin,
  Scale,
  Globe,
  Users,
  ChevronRight,
  Download,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';

interface PriceFloor {
  id: string;
  cropName: string;
  variety?: string;
  grade?: string;
  minPricePerKg: number;
  maxPricePerKg?: number;
  referencePricePerKg?: number;
  currency: string;
  district?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  authority?: string;
}

const marketTrendsData = [
  { month: 'Sep', maize: 320, beans: 750, potatoes: 180, coffee: 2800 },
  { month: 'Oct', maize: 335, beans: 770, potatoes: 190, coffee: 2900 },
  { month: 'Nov', maize: 350, beans: 790, potatoes: 195, coffee: 3100 },
  { month: 'Dec', maize: 360, beans: 810, potatoes: 200, coffee: 3000 },
  { month: 'Jan', maize: 345, beans: 800, potatoes: 195, coffee: 3050 },
  { month: 'Feb', maize: 355, beans: 820, potatoes: 205, coffee: 3200 },
];

const complianceData = [
  { district: 'Musanze', totalListings: 45, violations: 2, complianceRate: 95.6 },
  { district: 'Nyabihu', totalListings: 38, violations: 1, complianceRate: 97.4 },
  { district: 'Gicumbi', totalListings: 62, violations: 5, complianceRate: 91.9 },
  { district: 'Burera', totalListings: 29, violations: 0, complianceRate: 100 },
  { district: 'Rulindo', totalListings: 41, violations: 3, complianceRate: 92.7 },
  { district: 'Gakenke', totalListings: 33, violations: 1, complianceRate: 97.0 },
];

const mockPriceFloors: PriceFloor[] = [
  { id: '1', cropName: 'Maize', grade: 'Grade A', minPricePerKg: 320, maxPricePerKg: 420, referencePricePerKg: 355, currency: 'RWF', effectiveFrom: '2024-01-01', isActive: true, authority: 'MINAGRI' },
  { id: '2', cropName: 'Beans', grade: 'Grade A', minPricePerKg: 700, maxPricePerKg: 900, referencePricePerKg: 810, currency: 'RWF', effectiveFrom: '2024-01-01', isActive: true, authority: 'MINAGRI' },
  { id: '3', cropName: 'Irish Potatoes', grade: 'Grade A', minPricePerKg: 160, maxPricePerKg: 250, referencePricePerKg: 200, currency: 'RWF', effectiveFrom: '2024-01-01', isActive: true, authority: 'MINAGRI' },
  { id: '4', cropName: 'Coffee (Washed)', grade: 'AA', minPricePerKg: 2800, maxPricePerKg: 3500, referencePricePerKg: 3100, currency: 'RWF', effectiveFrom: '2024-01-01', isActive: true, authority: 'NAEB' },
  { id: '5', cropName: 'Sorghum', grade: 'Grade B', minPricePerKg: 160, maxPricePerKg: 220, referencePricePerKg: 185, currency: 'RWF', effectiveFrom: '2024-01-01', isActive: true, authority: 'MINAGRI' },
];

export default function GovernmentDashboard() {
  const { user } = useAuth();
  const [priceFloors, setPriceFloors] = useState<PriceFloor[]>(mockPriceFloors);
  const [loading, setLoading] = useState(false);
  const [showNewFloor, setShowNewFloor] = useState(false);
  const [newFloor, setNewFloor] = useState({ cropName: '', grade: '', minPricePerKg: '', maxPricePerKg: '', referencePricePerKg: '', district: '', authority: 'MINAGRI' });

  const totalViolations = complianceData.reduce((s, d) => s + d.violations, 0);
  const avgCompliance = complianceData.reduce((s, d) => s + d.complianceRate, 0) / complianceData.length;
  const totalVolume = 248500; // kg
  const totalTransactions = 156;

  const handleSetPriceFloor = async () => {
    if (!newFloor.cropName || !newFloor.minPricePerKg) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      await apiClient.setPriceFloor({
        ...newFloor,
        minPricePerKg: parseFloat(newFloor.minPricePerKg),
        maxPricePerKg: newFloor.maxPricePerKg ? parseFloat(newFloor.maxPricePerKg) : undefined,
        referencePricePerKg: newFloor.referencePricePerKg ? parseFloat(newFloor.referencePricePerKg) : undefined,
        effectiveFrom: new Date().toISOString(),
      });
      toast.success('Price floor set successfully!');
      setShowNewFloor(false);
    } catch {
      toast.error('Failed to set price floor');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-8 h-8 text-indigo-600" />
                Government Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Market oversight, price floor enforcement, and compliance monitoring — MINAGRI / RCA
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Dialog open={showNewFloor} onOpenChange={setShowNewFloor}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Settings className="w-4 h-4 mr-2" />
                    Set Price Floor
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Set Government Price Floor</DialogTitle>
                    <DialogDescription>
                      Set minimum and reference prices to protect farmers and stabilize markets.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Crop Name *</Label>
                        <Input value={newFloor.cropName} onChange={e => setNewFloor(p => ({ ...p, cropName: e.target.value }))} placeholder="e.g. Maize" />
                      </div>
                      <div>
                        <Label>Grade</Label>
                        <Input value={newFloor.grade} onChange={e => setNewFloor(p => ({ ...p, grade: e.target.value }))} placeholder="e.g. Grade A" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Min Price (RWF/kg) *</Label>
                        <Input type="number" value={newFloor.minPricePerKg} onChange={e => setNewFloor(p => ({ ...p, minPricePerKg: e.target.value }))} placeholder="320" />
                      </div>
                      <div>
                        <Label>Reference Price</Label>
                        <Input type="number" value={newFloor.referencePricePerKg} onChange={e => setNewFloor(p => ({ ...p, referencePricePerKg: e.target.value }))} placeholder="350" />
                      </div>
                      <div>
                        <Label>Max Price</Label>
                        <Input type="number" value={newFloor.maxPricePerKg} onChange={e => setNewFloor(p => ({ ...p, maxPricePerKg: e.target.value }))} placeholder="420" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>District (leave blank for national)</Label>
                        <Input value={newFloor.district} onChange={e => setNewFloor(p => ({ ...p, district: e.target.value }))} placeholder="All districts" />
                      </div>
                      <div>
                        <Label>Setting Authority</Label>
                        <Select value={newFloor.authority} onValueChange={v => setNewFloor(p => ({ ...p, authority: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MINAGRI">MINAGRI</SelectItem>
                            <SelectItem value="NAEB">NAEB</SelectItem>
                            <SelectItem value="RCA">RCA</SelectItem>
                            <SelectItem value="RAB">RAB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewFloor(false)}>Cancel</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSetPriceFloor}>Set Price Floor</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Market Compliance', value: `${avgCompliance.toFixed(1)}%`, change: '+2.3% from last month', icon: Shield, color: 'text-green-600', bg: 'bg-green-50' },
              { title: 'Price Violations', value: totalViolations, change: 'Listings below floor', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
              { title: 'Total Market Volume', value: `${(totalVolume / 1000).toFixed(0)}t`, change: 'This month', icon: Scale, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Active Cooperatives', value: '48', change: '+3 newly registered', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Trends */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Market Price Trends (RWF/kg)
                  </CardTitle>
                  <CardDescription>6-month price trend by major crop</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={marketTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="maize" stroke="#16a34a" strokeWidth={2} name="Maize" />
                      <Line type="monotone" dataKey="beans" stroke="#2563eb" strokeWidth={2} name="Beans" />
                      <Line type="monotone" dataKey="potatoes" stroke="#d97706" strokeWidth={2} name="Potatoes" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* District Compliance */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    District Compliance Rates
                  </CardTitle>
                  <CardDescription>Price floor compliance by district</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={complianceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="district" tick={{ fontSize: 11 }} />
                      <YAxis domain={[85, 100]} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Compliance']} />
                      <Bar dataKey="complianceRate" fill="#6366f1" radius={[4, 4, 0, 0]} name="Compliance %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Price Floors Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Active Price Floors
                </CardTitle>
                <CardDescription>
                  Government-mandated minimum prices. Listings below these prices are flagged.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crop</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Min Price (RWF/kg)</TableHead>
                      <TableHead>Reference Price</TableHead>
                      <TableHead>Max Price</TableHead>
                      <TableHead>Authority</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceFloors.map(floor => (
                      <TableRow key={floor.id}>
                        <TableCell className="font-medium">{floor.cropName}</TableCell>
                        <TableCell>{floor.grade || '—'}</TableCell>
                        <TableCell className="font-bold text-green-700">{floor.minPricePerKg.toLocaleString()}</TableCell>
                        <TableCell className="text-blue-600">{floor.referencePricePerKg?.toLocaleString() || '—'}</TableCell>
                        <TableCell>{floor.maxPricePerKg?.toLocaleString() || '—'}</TableCell>
                        <TableCell>
                          <Badge className="bg-indigo-100 text-indigo-800">{floor.authority}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${floor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {floor.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          {/* District Compliance Detail */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Compliance Report by District
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceData.map(d => (
                    <div key={d.district} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-24 font-medium">{d.district}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{d.totalListings} listings</span>
                          <span className={d.complianceRate >= 95 ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>
                            {d.complianceRate}%
                          </span>
                        </div>
                        <Progress
                          value={d.complianceRate}
                          className="h-2"
                        />
                      </div>
                      <div className="text-right">
                        {d.violations > 0 ? (
                          <Badge className="bg-red-100 text-red-800">
                            {d.violations} violation{d.violations > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                        )}
                      </div>
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
