import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchVehicles } from '../../features/vehicles/vehiclesSlice';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Plus, Search, Truck, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VehicleList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items: vehicles, status } = useSelector((state: RootState) => state.vehicles);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchVehicles());
    }
  }, [dispatch, status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'in_service': return 'warning';
      case 'suspended': return 'danger';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <Header 
        title="My Fleet" 
        rightElement={
          <button 
            className="p-2 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
            onClick={() => navigate('/vehicles/add')}
          >
            <Plus size={20} />
          </button>
        }
      />
      
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="w-full bg-[var(--bg-surface-alt)] border border-[var(--border)] text-[var(--text-main)] rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            placeholder="Search vehicles by reg number..."
          />
        </div>

        {/* List */}
        {status === 'loading' ? (
          <div className="text-center p-8 text-[var(--text-muted)]">Loading fleet...</div>
        ) : vehicles.length === 0 ? (
          <div className="text-center p-12 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] mt-8">
            <Truck size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
            <h3 className="text-lg font-medium mb-2">No vehicles yet</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">Add your first vehicle to start managing your fleet.</p>
            <button 
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium"
              onClick={() => navigate('/vehicles/add')}
            >
              Add Vehicle
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <Card 
                key={vehicle.id} 
                className="flex items-center justify-between p-4 cursor-pointer hover:border-[var(--primary-light)] transition-colors active:scale-[0.99]"
                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--bg-surface-alt)] rounded-lg flex items-center justify-center text-[var(--primary)]">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{vehicle.reg_number}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{vehicle.type}</span>
                      <span className="w-1 h-1 rounded-full bg-[var(--border)]"></span>
                      <span className="text-xs text-[var(--text-muted)]">{vehicle.make} {vehicle.model}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button className="p-1 text-[var(--text-muted)] hover:text-white" onClick={(e) => { e.stopPropagation(); }}>
                    <MoreVertical size={20} />
                  </button>
                  <Badge variant={getStatusColor(vehicle.status) as any}>
                    {getStatusText(vehicle.status)}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
