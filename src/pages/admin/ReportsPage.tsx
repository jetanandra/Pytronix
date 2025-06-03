import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart2, 
  PieChart, 
  DollarSign, 
  Package, 
  ShoppingBag,
  ArrowDown,
  Printer
} from 'lucide-react';
import { generateSalesReport } from '../../services/orderService';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState<string>(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'customers'>('sales');
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);
  
  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      
      if (reportType === 'sales') {
        const data = await generateSalesReport(new Date(startDate), new Date(endDate));
        setReportData(data);
      } else {
        // For demo purposes, we'll just show a toast for other report types
        toast.info(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generation is not implemented yet`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadPDF = () => {
    if (!reportData) return;
    
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Phytronix Sales Report', 105, 15, { align: 'center' });
      
      // Add report period
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 105, 25, { align: 'center' });
      
      // Add summary section
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Summary', 14, 40);
      
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`Total Orders: ${reportData.totalOrders}`, 14, 50);
      doc.text(`Total Revenue: ₹${reportData.totalRevenue.toLocaleString()}`, 14, 58);
      
      // Add order status breakdown
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Order Status Breakdown', 14, 75);
      
      const statusData = [
        ['Status', 'Count'],
        ['Pending', reportData.ordersByStatus.pending],
        ['Processing', reportData.ordersByStatus.processing],
        ['Shipped', reportData.ordersByStatus.shipped],
        ['Delivered', reportData.ordersByStatus.delivered],
        ['Cancelled', reportData.ordersByStatus.cancelled]
      ];
      
      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: 80,
        head: [statusData[0]],
        body: statusData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // Add top selling products
      const productSales = reportData.productSales;
      if (productSales && productSales.length > 0) {
        // Sort products by revenue
        const sortedProducts = [...productSales].sort((a, b) => b.totalRevenue - a.totalRevenue);
        
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        // @ts-ignore - jspdf-autotable types
        const finalY = doc.lastAutoTable.finalY || 150;
        doc.text('Top Selling Products', 14, finalY + 15);
        
        const productData = [
          ['Product', 'Quantity Sold', 'Revenue (₹)'],
          ...sortedProducts.slice(0, 10).map(product => [
            product.name,
            product.totalQuantity,
            product.totalRevenue.toLocaleString()
          ])
        ];
        
        // @ts-ignore - jspdf-autotable types
        doc.autoTable({
          startY: finalY + 20,
          head: [productData[0]],
          body: productData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] }
        });
      }
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      // Save the PDF
      doc.save(`phytronix-sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download report');
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Reports
      </h1>
      
      {/* Report Generator */}
      <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Generate Report
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
            >
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="customers">Customer Report</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <LoaderSpinner size="sm\" color="blue" />
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Quick Date Presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => {
              const today = new Date();
              const lastWeek = new Date();
              lastWeek.setDate(today.getDate() - 7);
              setStartDate(lastWeek.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const lastMonth = new Date();
              lastMonth.setMonth(today.getMonth() - 1);
              setStartDate(lastMonth.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
              setStartDate(firstDay.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            This Month
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
              const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
              setStartDate(firstDay.toISOString().split('T')[0]);
              setEndDate(lastDay.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Last Month
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), 0, 1);
              setStartDate(firstDay.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Year to Date
          </button>
        </div>
      </div>
      
      {/* Report Results */}
      {reportData && (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6 mb-8" id="report-content">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sales Report: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-dark-navy rounded-lg p-6">
              <div className="flex items-center mb-2">
                <ShoppingBag className="w-5 h-5 text-neon-blue mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Orders
                </h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {reportData.totalOrders}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Delivered: </span>
                  <span className="font-medium text-gray-900 dark:text-white">{reportData.ordersByStatus.delivered}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Cancelled: </span>
                  <span className="font-medium text-gray-900 dark:text-white">{reportData.ordersByStatus.cancelled}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-navy rounded-lg p-6">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-neon-green mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Revenue
                </h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ₹{reportData.totalRevenue.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                From delivered orders
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-navy rounded-lg p-6">
              <div className="flex items-center mb-2">
                <BarChart2 className="w-5 h-5 text-neon-violet mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order Status
                </h3>
              </div>
              <div className="mt-2">
                <OrderStatusChart data={reportData.ordersByStatus} />
              </div>
            </div>
          </div>
          
          {/* Top Selling Products */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Selling Products
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-dark-navy">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Quantity Sold
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-light-navy divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.productSales.length > 0 ? (
                    [...reportData.productSales]
                      .sort((a, b) => b.totalRevenue - a.totalRevenue)
                      .slice(0, 10)
                      .map((product, index) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {product.totalQuantity}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              ₹{product.totalRevenue.toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No product sales data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Available Reports */}
      <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Reports
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-neon-blue dark:hover:border-neon-blue transition-colors">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                <BarChart2 className="w-5 h-5 text-neon-blue" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Sales Report
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-soft-gray mb-4">
              Comprehensive analysis of sales performance, revenue, and order statistics.
            </p>
            <button
              onClick={() => {
                setReportType('sales');
                handleGenerateReport();
              }}
              className="text-neon-blue hover:text-blue-700 text-sm font-medium flex items-center"
            >
              Generate Report <ArrowDown className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-neon-blue dark:hover:border-neon-blue transition-colors">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-3">
                <Package className="w-5 h-5 text-neon-green" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Inventory Report
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-soft-gray mb-4">
              Stock levels, product performance, and inventory valuation analysis.
            </p>
            <button
              onClick={() => {
                setReportType('inventory');
                handleGenerateReport();
              }}
              className="text-neon-blue hover:text-blue-700 text-sm font-medium flex items-center"
            >
              Generate Report <ArrowDown className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-neon-blue dark:hover:border-neon-blue transition-colors">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-neon-violet" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Customer Report
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-soft-gray mb-4">
              Customer acquisition, retention, and purchasing behavior analysis.
            </p>
            <button
              onClick={() => {
                setReportType('customers');
                handleGenerateReport();
              }}
              className="text-neon-blue hover:text-blue-700 text-sm font-medium flex items-center"
            >
              Generate Report <ArrowDown className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;