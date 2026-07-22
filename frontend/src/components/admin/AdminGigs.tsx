import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { ShoppingBag, Search } from 'lucide-react';
import { apiService } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

export const AdminGigs: React.FC = () => {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadGigs();
  }, []);

  const loadGigs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminGigs(1, 50, searchTerm ? { search: searchTerm } : undefined);
      setGigs(response.gigs || []);
    } catch (error) {
      console.error('Failed to load gigs:', error);
      setGigs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadGigs();
  };

  const filteredGigs = gigs.filter(gig =>
    !searchTerm ||
    gig.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gig.freelancer?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gigs Management</h1>
        <p className="text-gray-600 text-sm mt-1">Manage all platform gigs</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search gigs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            All Gigs ({filteredGigs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGigs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4" />
              <p>No gigs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGigs.map((gig) => (
                <div key={gig.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link to={`/marketplace/gigs/${gig.id}`} className="font-medium text-gray-900 hover:text-purple-600">
                        {gig.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Freelancer: {gig.freelancer?.username || 'Unknown'} • ETB {gig.price} • {gig.category}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(gig.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      gig.status === 'active' ? 'bg-green-100 text-green-700' :
                      gig.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {gig.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
