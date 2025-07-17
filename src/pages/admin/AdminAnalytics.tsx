import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { getOrders, Order } from '../../lib/database';
import { isSupabaseAvailable } from '../../lib/supabase';
import SalesChart from '../../components/SalesChart';

interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    quantity: number;
  }>;
  dailySales: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  weeklySales: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  monthlySales: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      if (isSupabaseAvailable()) {
        const orders = await getOrders();
        const processedData = processOrdersData(orders);
        setAnalytics(processedData);
      } else {
        // Provide sample analytics data when Supabase is not available
        console.warn('Supabase not available - using sample analytics data');
        const sampleData = createSampleAnalyticsData();
        setAnalytics(sampleData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback to sample data on error
      const sampleData = createSampleAnalyticsData();
      setAnalytics(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const createSampleAnalyticsData = (): AnalyticsData => {
    return {
      totalSales: 15750,
      totalOrders: 42,
      averageOrderValue: 375,
      topProducts: [
        { name: 'Produit Premium', sales: 4500, quantity: 12 },
        { name: 'Article Populaire', sales: 3200, quantity: 16 },
        { name: 'Nouveau Produit', sales: 2800, quantity: 8 },
        { name: 'Produit Classique', sales: 2100, quantity: 14 },
        { name: 'Article Tendance', sales: 1650, quantity: 6 }
      ],
      dailySales: [
        { date: '15 Jan', sales: 1200, orders: 3 },
        { date: '16 Jan', sales: 1800, orders: 5 },
        { date: '17 Jan', sales: 2200, orders: 6 },
        { date: '18 Jan', sales: 1600, orders: 4 },
        { date: '19 Jan', sales: 2800, orders: 8 },
        { date: '20 Jan', sales: 3200, orders: 9 },
        { date: '21 Jan', sales: 2950, orders: 7 }
      ],
      weeklySales: [
        { date: 'Sem 1', sales: 8500, orders: 22 },
        { date: 'Sem 2', sales: 9200, orders: 25 },
        { date: 'Sem 3', sales: 7800, orders: 19 },
        { date: 'Sem 4', sales: 10500, orders: 28 }
      ],
      monthlySales: [
        { date: 'Août 24', sales: 28500, orders: 75 },
        { date: 'Sept 24', sales: 32200, orders: 85 },
        { date: 'Oct 24', sales: 29800, orders: 78 },
        { date: 'Nov 24', sales: 35500, orders: 92 },
        { date: 'Déc 24', sales: 41200, orders: 108 },
        { date: 'Jan 25', sales: 38900, orders: 98 }
      ]
    };
  };

  const processOrdersData = (orders: Order[]): AnalyticsData => {
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Process product data
    const productMap = new Map();
    orders.forEach(order => {
      order.items.forEach(item => {
        if (productMap.has(item.product_id)) {
          const existing = productMap.get(item.product_id);
          existing.quantity += item.quantity;
          existing.sales += item.price * item.quantity;
        } else {
          productMap.set(item.product_id, {
            name: item.product_name,
            quantity: item.quantity,
            sales: item.price * item.quantity
          });
        }
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Process time-based data
    const dailySales = processDailySales(orders);
    const weeklySales = processWeeklySales(orders);
    const monthlySales = processMonthlySales(orders);

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      topProducts,
      dailySales,
      weeklySales,
      monthlySales
    };
  };

  const processDailySales = (orders: Order[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayOrders = orders.filter(order => 
        order.created_at.split('T')[0] === date
      );
      
      return {
        date: new Date(date).toLocaleDateString('fr-FR', { 
          month: 'short', 
          day: 'numeric' 
        }),
        sales: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length
      };
    });
  };

  const processWeeklySales = (orders: Order[]) => {
    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      return date;
    }).reverse();

    return last4Weeks.map((weekStart, index) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= weekStart && orderDate <= weekEnd;
      });
      
      return {
        date: `Sem ${index + 1}`,
        sales: weekOrders.reduce((sum, order) => sum + order.total, 0),
        orders: weekOrders.length
      };
    });
  };

  const processMonthlySales = (orders: Order[]) => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date;
    }).reverse();

    return last6Months.map(month => {
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === month.getMonth() &&
               orderDate.getFullYear() === month.getFullYear();
      });
      
      return {
        date: month.toLocaleDateString('fr-FR', { 
          month: 'short',
          year: '2-digit'
        }),
        sales: monthOrders.reduce((sum, order) => sum + order.total, 0),
        orders: monthOrders.length
      };
    });
  };

  const getChartData = () => {
    if (!analytics) return [];
    
    switch (timeRange) {
      case 'daily':
        return analytics.dailySales;
      case 'weekly':
        return analytics.weeklySales;
      case 'monthly':
        return analytics.monthlySales;
      default:
        return analytics.dailySales;
    }
  };

  const getChartTitle = () => {
    const timeRangeText = {
      daily: 'Ventes Quotidiennes (7 derniers jours)',
      weekly: 'Ventes Hebdomadaires (4 dernières semaines)',
      monthly: 'Ventes Mensuelles (6 derniers mois)'
    };
    return timeRangeText[timeRange];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erreur lors du chargement des données</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Analyses des Ventes</h1>
        <button
          onClick={loadAnalytics}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">+12%</span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Ventes Totales</h3>
          <p className="text-2xl font-bold text-gray-800">{analytics.totalSales.toLocaleString()} MAD</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-blue-600">+8%</span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Commandes Totales</h3>
          <p className="text-2xl font-bold text-gray-800">{analytics.totalOrders}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-purple-600">+5%</span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Panier Moyen</h3>
          <p className="text-2xl font-bold text-gray-800">{analytics.averageOrderValue.toFixed(0)} MAD</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-orange-600">+15%</span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Taux de Conversion</h3>
          <p className="text-2xl font-bold text-gray-800">3.2%</p>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Évolution des Ventes</h3>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['daily', 'weekly', 'monthly'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {range === 'daily' ? 'Jour' : range === 'weekly' ? 'Semaine' : 'Mois'}
                </button>
              ))}
            </div>

            {/* Chart Type Selector */}
            <div className="flex space-x-2">
              {([
                { type: 'line' as const, icon: LineChart },
                { type: 'bar' as const, icon: BarChart3 },
                { type: 'pie' as const, icon: PieChart }
              ]).map(({ type, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`p-2 rounded-lg transition-colors ${
                    chartType === type
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <SalesChart
          data={getChartData()}
          type={chartType}
          title={getChartTitle()}
        />
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Produits les Plus Vendus</h3>
        
        <div className="space-y-4">
          {analytics.topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune donnée de vente disponible</p>
          ) : (
            analytics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.quantity} unités vendues</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {product.sales.toLocaleString()} MAD
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;