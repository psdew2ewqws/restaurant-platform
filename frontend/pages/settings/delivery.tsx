import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, MapPinIcon, TruckIcon, CogIcon } from '@heroicons/react/24/outline';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import DeliveryZoneManagement from '../../src/components/delivery/DeliveryZoneManagement';
import DeliveryProviders from '../../src/components/delivery/DeliveryProviders';
import DeliveryStats from '../../src/components/delivery/DeliveryStats';

export default function DeliverySettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('zones');
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'zones', name: 'Delivery Zones', icon: MapPinIcon },
    { id: 'providers', name: 'Delivery Providers', icon: TruckIcon },
    { id: 'stats', name: 'Statistics', icon: CogIcon },
  ];

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['super_admin', 'company_owner', 'branch_manager']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'company_owner', 'branch_manager']}>
      <Head>
        <title>Delivery Settings - Restaurant Platform</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Link href="/dashboard" className="mr-4">
                <ArrowLeftIcon className="h-6 w-6 text-gray-600 hover:text-gray-800" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Delivery Settings</h1>
            </div>
            <p className="mt-2 text-gray-600">
              Manage your delivery zones, providers, and settings for Jordan market
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow">
            {activeTab === 'zones' && <DeliveryZoneManagement />}
            {activeTab === 'providers' && <DeliveryProviders />}
            {activeTab === 'stats' && <DeliveryStats />}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}