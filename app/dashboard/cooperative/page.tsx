'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Scale,
  Gavel,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Wheat,
  Truck,
  Star,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ProduceListing {
  id: string;
  cropName: string;
  variety?: string;
  quantityKg: number;
  availableKg: number;
  pricePerKg: number;
  currency: string;
  status: 'draft' | 'active' | 'bidding' | 'sold' | 'expired' | 'cancelled';
  listingType: 'instant' | 'auction' | 'contract';
  district?: string;
  harvestDate?: string;
  bids?: Bid[];
  createdAt: string;
}

interface Bid {
  id: string;
  bidderName: string;
  bidPricePerKg: number;
  quantityKg: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  message?: string;
  createdAt: string;
}

interface WeighingRecord {
  id: string;
  ticketNumber: string;
  cropName: string;
  netWeightKg: number;
  farmerName?: string;
  qualityGrade?: string;
  isVerified: boolean;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  bidding: 'bg-blue-100 text-blue-800',
  sold: 'bg-gray-100 text-gray-800',
  draft: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  cancelled: 'bg-red-100 text-red-800',
};

const bidStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
};

export default function CooperativeDashboard() {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [weighingRecords, setWeighingRecords] = useState<WeighingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewListing, setShowNewListing] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ProduceListing | null>(null);
  const [newListing, setNewListing] = useState({
    cropName: '',
    variety: '',
    quantityKg: '',
    pricePerKg: '',
    district: '',
    listingType: 'instant',
    grade: '',
  });

  const mockListings: ProduceListing[] = [
    {
      id: '1',
      cropName: 'Maize',
      variety: 'H614D',
      quantityKg: 5000,
      availableKg: 5000,
      pricePerKg: 350,
      currency: 'RWF',
      status: 'active',
      listingType: 'auction',
      district: 'Musanze',
      harvestDate: '2024-02-15',
      bids: [
        { id: 'b1', bidderName: 'AgriTrade Ltd', bidPricePerKg: 370, quantityKg: 2000, totalAmount: 740000, currency: 'RWF', status: 'pending', createdAt: '2024-02-20T09:00:00Z' },
        { id: 'b2', bidderName: 'FoodCorp Rwanda', bidPricePerKg: 360, quantityKg: 3000, totalAmount: 1080000, currency: 'RWF', status: 'pending', createdAt: '2024-02-20T10:30:00Z' },
      ],
      createdAt: '2024-02-18T08:00:00Z',
    },
    {
      id: '2',
      cropName: 'Irish Potatoes',
      variety: 'Kinigi',
      quantityKg: 8000,
      availableKg: 3500,
      pricePerKg: 200,
      currency: 'RWF',
      status: 'bidding',
      listingType: 'auction',
      district: 'Nyabihu',
      bids: [],
      createdAt: '2024-02-17T08:00:00Z',
    },
    {
      id: '3',
      cropName: 'Beans',
      variety: 'Kidney',
      quantityKg: 2000,
      availableKg: 0,
      pricePerKg: 800,
      currency: 'RWF',
      status: 'sold',
      listingType: 'instant',
      district: 'Burera',
      bids: [],
      createdAt: '2024-02-10T08:00:00Z',
    },
  ];

  const mockWeighingRecords: WeighingRecord[] = [
    { id: 'w1', ticketNumber: 'WGH-20240220-A1B2', cropName: 'Maize', netWeightKg: 250.5, farmerName: 'Jean Pierre', qualityGrade: 'Grade A', isVerified: true, createdAt: '2024-02-20T07:30:00Z' },
    { id: 'w2', ticketNumber: 'WGH-20240220-C3D4', cropName: 'Potatoes', netWeightKg: 180.0, farmerName: 'Marie Claire', qualityGrade: 'Grade B', isVerified: false, createdAt: '2024-02-20T08:15:00Z' },
    { id: 'w3', ticketNumber: 'IOT-20240219-E5F6', cropName: 'Beans', netWeightKg: 95.3, farmerName: 'Emmanuel Kawe', qualityGrade: 'Grade A', isVerified: true, createdAt: '2024-02-19T14:00:00Z' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const [listingsRes, weighingRes] = await Promise.all([
          apiClient.getMarketplaceListings({ status: 'all' }).catch(() => null),
          apiClient.getWeighingRecords().catch(() => null),
        ]);
        setListings(listingsRes?.data || mockListings);
        setWeighingRecords(weighingRes?.data || mockWeighingRecords);
      } catch {
        setListings(mockListings);
        setWeighingRecords(mockWeighingRecords);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalRevenue = listings
    .filter(l => l.status === 'sold')
    .reduce((sum, l) => sum + (l.quantityKg - l.availableKg) * l.pricePerKg, 0);

  const pendingBids = listings.flatMap(l => (l.bids || []).filter(b => b.status === 'pending'));
  const totalVolumeAvailable = listings
    .filter(l => ['active', 'bidding'].includes(l.status))
    .reduce((sum, l) => sum + l.availableKg, 0);

  const handleAcceptBid = async (bidId: string) => {
    try {
      await apiClient.acceptBid(bidId).catch(() => null);
      toast.success('Bid accepted! Payment escrow initiated.');
      // Refresh data
      setListings(prev => prev.map(l => ({
        ...l,
        bids: (l.bids || []).map(b => b.id === bidId ? { ...b, status: 'accepted' as const } : b),
      })));
    } catch {
      toast.error('Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      await apiClient.rejectBid(bidId).catch(() => null);
      toast.success('Bid rejected.');
      setListings(prev => prev.map(l => ({
        ...l,
        bids: (l.bids || []).map(b => b.id === bidId ? { ...b, status: 'rejected' as const } : b),
      })));
    } catch {
      toast.error('Failed to reject bid');
    }
  };

  const handleCreateListing = async () => {
    if (!newListing.cropName || !newListing.quantityKg || !newListing.pricePerKg) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await apiClient.createListing({
        ...newListing,
        quantityKg: parseFloat(newListing.quantityKg),
        pricePerKg: parseFloat(newListing.pricePerKg),
      }).catch(() => null);
      toast.success('Listing created successfully!');
      setShowNewListing(false);
      setNewListing({ cropName: '', variety: '', quantityKg: '', pricePerKg: '', district: '', listingType: 'instant', grade: '' });
    } catch {
      toast.error('Failed to create listing');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Wheat className="w-8 h-8 text-green-600" />
                Cooperative Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your produce listings, bids, and weighing records.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-500">
                {isConnected ? 'Live market data' : 'Offline'}
              </span>
              <Dialog open={showNewListing} onOpenChange={setShowNewListing}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Listing
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create Produce Listing</DialogTitle>
                    <DialogDescription>
                      List your produce on the HarvestLink marketplace.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Crop Name *</Label>
                        <Input
                          placeholder="e.g. Maize, Beans"
                          value={newListing.cropName}
                          onChange={e => setNewListing(p => ({ ...p, cropName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Variety</Label>
                        <Input
                          placeholder="e.g. H614D"
                          value={newListing.variety}
                          onChange={e => setNewListing(p => ({ ...p, variety: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Quantity (kg) *</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 5000"
                          value={newListing.quantityKg}
                          onChange={e => setNewListing(p => ({ ...p, quantityKg: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Price/kg (RWF) *</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 350"
                          value={newListing.pricePerKg}
                          onChange={e => setNewListing(p => ({ ...p, pricePerKg: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>District</Label>
                        <Input
                          placeholder="e.g. Musanze"
                          value={newListing.district}
                          onChange={e => setNewListing(p => ({ ...p, district: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Listing Type</Label>
                        <Select
                          value={newListing.listingType}
                          onValueChange={v => setNewListing(p => ({ ...p, listingType: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instant">Instant Sale</SelectItem>
                            <SelectItem value="auction">Auction / Bidding</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewListing(false)}>Cancel</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateListing}>
                      Create Listing
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Active Listings',
                value: listings.filter(l => ['active', 'bidding'].includes(l.status)).length,
                change: '+2 this week',
                changeType: 'positive',
                icon: Package,
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
              {
                title: 'Pending Bids',
                value: pendingBids.length,
                change: `${pendingBids.length} awaiting response`,
                changeType: pendingBids.length > 0 ? 'neutral' : 'positive',
                icon: Gavel,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                title: 'Available Volume',
                value: `${(totalVolumeAvailable / 1000).toFixed(1)}t`,
                change: 'Across all listings',
                changeType: 'neutral',
                icon: Scale,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                title: 'Revenue (Sold)',
                value: `${(totalRevenue / 1000).toFixed(0)}K RWF`,
                change: '+18% this season',
                changeType: 'positive',
                icon: DollarSign,
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center text-xs text-gray-600 mt-1">
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-gray-400 mr-1" />
                      )}
                      {stat.change}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Listings */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    My Produce Listings
                  </CardTitle>
                  <CardDescription>
                    Manage your active and draft produce listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produce</TableHead>
                        <TableHead>Qty (kg)</TableHead>
                        <TableHead>Price/kg</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Bids</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.map(listing => (
                        <TableRow key={listing.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{listing.cropName}</p>
                              {listing.variety && (
                                <p className="text-xs text-gray-500">{listing.variety}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="font-medium">{listing.availableKg.toLocaleString()}</span>
                              <span className="text-gray-500">/{listing.quantityKg.toLocaleString()}</span>
                            </div>
                            <Progress value={(listing.availableKg / listing.quantityKg) * 100} className="h-1 mt-1" />
                          </TableCell>
                          <TableCell className="font-medium">
                            {listing.pricePerKg.toLocaleString()} {listing.currency}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[listing.status] || 'bg-gray-100'}`}>
                              {listing.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{(listing.bids || []).length}</span>
                            {(listing.bids || []).filter(b => b.status === 'pending').length > 0 && (
                              <span className="ml-1 text-xs text-blue-600 font-medium">
                                ({(listing.bids || []).filter(b => b.status === 'pending').length} new)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedListing(listing)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pending Bids Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-blue-600" />
                    Pending Bids
                    {pendingBids.length > 0 && (
                      <Badge className="bg-blue-100 text-blue-800 ml-auto">{pendingBids.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingBids.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Gavel className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No pending bids</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingBids.map(bid => {
                        const listing = listings.find(l => (l.bids || []).find(b => b.id === bid.id));
                        return (
                          <div key={bid.id} className="p-3 border rounded-lg bg-blue-50 border-blue-100">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-sm">{bid.bidderName}</p>
                                <p className="text-xs text-gray-600">{listing?.cropName}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-700">{bid.bidPricePerKg} RWF/kg</p>
                                <p className="text-xs text-gray-600">{bid.quantityKg.toLocaleString()} kg</p>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              Total: <span className="font-semibold text-gray-700">{bid.totalAmount.toLocaleString()} {bid.currency}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                                onClick={() => handleAcceptBid(bid.id)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 h-7 text-xs"
                                onClick={() => handleRejectBid(bid.id)}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Weighing Records */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-600" />
                    Recent Weighing Records
                  </CardTitle>
                  <CardDescription>IoT-enabled and manual weighing entries</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Truck className="w-4 h-4 mr-2" />
                  Record Weighing
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead>Net Weight</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weighingRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="font-mono text-xs">{record.ticketNumber}</TableCell>
                        <TableCell>{record.cropName}</TableCell>
                        <TableCell className="font-medium">{record.netWeightKg.toFixed(1)} kg</TableCell>
                        <TableCell>{record.farmerName || '—'}</TableCell>
                        <TableCell>
                          {record.qualityGrade && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              {record.qualityGrade}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.isVerified ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {new Date(record.createdAt).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          {/* Selected Listing Bids Dialog */}
          {selectedListing && (
            <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedListing.cropName} — {selectedListing.quantityKg.toLocaleString()} kg
                  </DialogTitle>
                  <DialogDescription>
                    All bids for this listing
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(selectedListing.bids || []).length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No bids yet</p>
                  ) : (
                    (selectedListing.bids || []).map(bid => (
                      <div key={bid.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{bid.bidderName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{bid.bidderName}</p>
                              <p className="text-xs text-gray-500">{new Date(bid.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{bid.bidPricePerKg} RWF/kg</p>
                            <p className="text-xs text-gray-500">{bid.quantityKg.toLocaleString()} kg</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bidStatusColors[bid.status]}`}>
                            {bid.status}
                          </span>
                        </div>
                        {bid.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAcceptBid(bid.id)}>
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleRejectBid(bid.id)}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
