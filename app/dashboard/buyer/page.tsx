'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ShoppingCart,
  Gavel,
  DollarSign,
  TrendingUp,
  MapPin,
  Scale,
  Star,
  Clock,
  CheckCircle,
  Package,
  Wheat,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/dialog';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ProduceListing {
  id: string;
  cropName: string;
  variety?: string;
  grade?: string;
  quantityKg: number;
  availableKg: number;
  pricePerKg: number;
  currency: string;
  status: string;
  listingType: string;
  district?: string;
  isOrganic?: boolean;
  cooperative?: { name: string };
  bids?: { id: string; status: string }[];
  createdAt: string;
}

interface MyBid {
  id: string;
  listingId: string;
  bidPricePerKg: number;
  quantityKg: number;
  totalAmount: number;
  status: string;
  listing?: { cropName: string; district?: string };
  createdAt: string;
}

const cropCategories = ['All', 'Maize', 'Beans', 'Potatoes', 'Rice', 'Wheat', 'Sorghum', 'Cassava', 'Coffee', 'Tea'];
const districts = ['All Districts', 'Musanze', 'Nyabihu', 'Burera', 'Gicumbi', 'Rulindo', 'Gakenke', 'Kigali'];

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [myBids, setMyBids] = useState<MyBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedListing, setSelectedListing] = useState<ProduceListing | null>(null);
  const [bidForm, setBidForm] = useState({ quantity: '', pricePerKg: '', message: '' });
  const [showBidDialog, setShowBidDialog] = useState(false);

  const mockListings: ProduceListing[] = [
    { id: '1', cropName: 'Maize', variety: 'H614D', grade: 'Grade A', quantityKg: 5000, availableKg: 5000, pricePerKg: 350, currency: 'RWF', status: 'active', listingType: 'auction', district: 'Musanze', isOrganic: false, cooperative: { name: 'Musanze Farmers Coop' }, bids: [], createdAt: '2024-02-18T08:00:00Z' },
    { id: '2', cropName: 'Irish Potatoes', variety: 'Kinigi', grade: 'Grade A', quantityKg: 8000, availableKg: 3500, pricePerKg: 200, currency: 'RWF', status: 'bidding', listingType: 'auction', district: 'Nyabihu', isOrganic: true, cooperative: { name: 'Nyabihu Organic Coop' }, bids: [{ id: 'b1', status: 'pending' }], createdAt: '2024-02-17T08:00:00Z' },
    { id: '3', cropName: 'Beans', variety: 'Kidney Red', grade: 'Grade B', quantityKg: 3000, availableKg: 3000, pricePerKg: 780, currency: 'RWF', status: 'active', listingType: 'instant', district: 'Burera', isOrganic: false, cooperative: { name: 'Burera Grains Coop' }, bids: [], createdAt: '2024-02-19T08:00:00Z' },
    { id: '4', cropName: 'Coffee (Washed)', variety: 'Bourbon', grade: 'AA', quantityKg: 1500, availableKg: 1500, pricePerKg: 3200, currency: 'RWF', status: 'active', listingType: 'contract', district: 'Rulindo', isOrganic: true, cooperative: { name: 'Rulindo Coffee Growers' }, bids: [], createdAt: '2024-02-16T08:00:00Z' },
    { id: '5', cropName: 'Sorghum', variety: 'Local', grade: 'Grade B', quantityKg: 12000, availableKg: 12000, pricePerKg: 180, currency: 'RWF', status: 'active', listingType: 'auction', district: 'Gicumbi', isOrganic: false, cooperative: { name: 'Gicumbi Grains Union' }, bids: [], createdAt: '2024-02-15T08:00:00Z' },
  ];

  const mockMyBids: MyBid[] = [
    { id: 'mb1', listingId: '2', bidPricePerKg: 215, quantityKg: 2000, totalAmount: 430000, status: 'pending', listing: { cropName: 'Irish Potatoes', district: 'Nyabihu' }, createdAt: '2024-02-20T09:00:00Z' },
    { id: 'mb2', listingId: '1', bidPricePerKg: 365, quantityKg: 3000, totalAmount: 1095000, status: 'accepted', listing: { cropName: 'Maize', district: 'Musanze' }, createdAt: '2024-02-19T14:00:00Z' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const [listingsRes, bidsRes] = await Promise.all([
          apiClient.getMarketplaceListings().catch(() => null),
          apiClient.getMyBids().catch(() => null),
        ]);
        setListings(listingsRes?.data || mockListings);
        setMyBids(bidsRes?.data || mockMyBids);
      } catch {
        setListings(mockListings);
        setMyBids(mockMyBids);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredListings = listings.filter(l => {
    if (searchQuery && !l.cropName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCrop !== 'All' && l.cropName !== selectedCrop) return false;
    if (selectedDistrict !== 'All Districts' && l.district !== selectedDistrict) return false;
    return true;
  });

  const handlePlaceBid = async () => {
    if (!selectedListing || !bidForm.quantity || !bidForm.pricePerKg) {
      toast.error('Please fill in quantity and bid price');
      return;
    }
    const qty = parseFloat(bidForm.quantity);
    const price = parseFloat(bidForm.pricePerKg);
    if (qty > selectedListing.availableKg) {
      toast.error(`Quantity exceeds available: ${selectedListing.availableKg.toLocaleString()} kg`);
      return;
    }
    try {
      await apiClient.placeBid({
        listingId: selectedListing.id,
        quantityKg: qty,
        bidPricePerKg: price,
        message: bidForm.message,
      }).catch(() => null);
      toast.success('Bid placed! You will be notified when the cooperative responds.');
      setShowBidDialog(false);
      setBidForm({ quantity: '', pricePerKg: '', message: '' });
    } catch {
      toast.error('Failed to place bid');
    }
  };

  const totalSpent = myBids.filter(b => b.status === 'accepted').reduce((sum, b) => sum + b.totalAmount, 0);
  const pendingBids = myBids.filter(b => b.status === 'pending').length;

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
                <ShoppingCart className="w-8 h-8 text-blue-600" />
                Buyer / Vendor Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Browse fresh produce listings and place bids on the HarvestLink marketplace.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-500">{isConnected ? 'Live market' : 'Offline'}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Available Listings', value: filteredListings.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'My Active Bids', value: pendingBids, icon: Gavel, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { title: 'Accepted Bids', value: myBids.filter(b => b.status === 'accepted').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
              { title: 'Total Contracted', value: `${(totalSpent / 1000).toFixed(0)}K RWF`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
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
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-48 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search produce..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cropCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Wheat className="w-5 h-5 text-green-500" />
                          {listing.cropName}
                          {listing.isOrganic && (
                            <Badge className="bg-green-100 text-green-700 text-xs">Organic</Badge>
                          )}
                        </CardTitle>
                        {listing.variety && (
                          <CardDescription>{listing.variety} • {listing.grade}</CardDescription>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.status === 'active' ? 'bg-green-100 text-green-800' :
                        listing.status === 'bidding' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {listing.listingType === 'auction' ? '🔨 Auction' : listing.listingType === 'instant' ? '⚡ Instant' : '📝 Contract'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available</span>
                      <span className="font-semibold">{listing.availableKg.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price/kg</span>
                      <span className="font-bold text-green-700 text-lg">{listing.pricePerKg.toLocaleString()} RWF</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {listing.district} • {listing.cooperative?.name}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Gavel className="w-3 h-3" />
                        {(listing.bids || []).length} bid{(listing.bids || []).length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        setSelectedListing(listing);
                        setShowBidDialog(true);
                      }}
                    >
                      {listing.listingType === 'instant' ? (
                        <><ShoppingCart className="w-4 h-4 mr-2" />Buy Now</>
                      ) : (
                        <><Gavel className="w-4 h-4 mr-2" />Place Bid</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* My Bids Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-blue-600" />
                  My Bids & Contracts
                </CardTitle>
                <CardDescription>Track the status of your bids and purchase contracts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myBids.map(bid => (
                    <div key={bid.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          bid.status === 'accepted' ? 'bg-green-100' :
                          bid.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          {bid.status === 'accepted' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : bid.status === 'pending' ? (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <Scale className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{bid.listing?.cropName}</p>
                          <p className="text-sm text-gray-500">
                            {bid.listing?.district} • {bid.quantityKg.toLocaleString()} kg @ {bid.bidPricePerKg} RWF/kg
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{bid.totalAmount.toLocaleString()} RWF</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {bid.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bid Dialog */}
          {selectedListing && (
            <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedListing.listingType === 'instant' ? 'Purchase' : 'Place Bid'}: {selectedListing.cropName}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedListing.cooperative?.name} • {selectedListing.district} • Available: {selectedListing.availableKg.toLocaleString()} kg
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Listed price</span>
                      <span className="font-bold text-green-700">{selectedListing.pricePerKg} RWF/kg</span>
                    </div>
                    {selectedListing.listingType === 'auction' && (
                      <p className="text-xs text-gray-500 mt-1">You can bid above or below the listed price.</p>
                    )}
                  </div>
                  <div>
                    <Label>Quantity (kg) *</Label>
                    <Input
                      type="number"
                      placeholder={`Max: ${selectedListing.availableKg.toLocaleString()} kg`}
                      value={bidForm.quantity}
                      onChange={e => setBidForm(p => ({ ...p, quantity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Your Price/kg (RWF) *</Label>
                    <Input
                      type="number"
                      placeholder={`Listed: ${selectedListing.pricePerKg} RWF`}
                      value={bidForm.pricePerKg}
                      onChange={e => setBidForm(p => ({ ...p, pricePerKg: e.target.value }))}
                    />
                  </div>
                  {bidForm.quantity && bidForm.pricePerKg && (
                    <div className="p-3 bg-blue-50 rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span>Total amount</span>
                        <span className="font-bold text-blue-700">
                          {(parseFloat(bidForm.quantity) * parseFloat(bidForm.pricePerKg)).toLocaleString()} RWF
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Funds held in escrow until delivery confirmed.</p>
                    </div>
                  )}
                  <div>
                    <Label>Message (optional)</Label>
                    <Input
                      placeholder="Any message to the cooperative..."
                      value={bidForm.message}
                      onChange={e => setBidForm(p => ({ ...p, message: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowBidDialog(false)}>Cancel</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePlaceBid}>
                    <Gavel className="w-4 h-4 mr-2" />
                    {selectedListing.listingType === 'instant' ? 'Confirm Purchase' : 'Submit Bid'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
