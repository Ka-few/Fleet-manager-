import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchVehicles, deleteVehicle } from '../../features/vehicles/vehiclesSlice';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Truck, Edit, Trash2, Calendar, Info, Wrench, Shield, Droplet } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const VehicleProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items: vehicles, status } = useSelector((state: RootState) => state.vehicles);

  const vehicle = vehicles.find(v => v.id === id);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchVehicles());
  }, [dispatch, status]);

  const handleDelete = async () => {
    if (!vehicle) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteVehicle(vehicle.id)).unwrap();
      navigate('/vehicles', { replace: true });
    } catch {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      alert('Failed to delete vehicle.');
    }
  };

  if (status === 'loading') {
    return <div className="p-8 text-center text-[var(--text-muted)]">Loading profile...</div>;
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col h-full bg-[var(--bg-main)]">
        <Header title="Not Found" showBack />
        <div className="p-8 text-center text-[var(--text-muted)]">Vehicle not found</div>
      </div>
    );
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'active': return 'success';
      case 'in_service': return 'warning';
      case 'suspended': return 'danger';
      default: return 'default';
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-[var(--bg-main)]">
        <Header
          title={vehicle.reg_number}
          showBack
          rightElement={
            <div className="flex items-center gap-1">
              <button
                className="p-2 text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-full transition-colors"
                onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
              >
                <Edit size={20} />
              </button>
              <button
                className="p-2 text-[var(--danger)] hover:bg-[var(--danger-light)] rounded-full transition-colors"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Top Profile Card */}
          <Card className="flex flex-col items-center p-6 text-center">
            <div className="w-20 h-20 bg-[var(--bg-surface-alt)] rounded-full flex items-center justify-center text-[var(--primary)] mb-4">
              <Truck size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-1">{vehicle.reg_number}</h2>
            <p className="text-[var(--text-muted)] mb-3 capitalize">{vehicle.nickname || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || vehicle.type}</p>
            <Badge variant={getStatusColor(vehicle.status) as any} className="px-4 py-1 text-sm">
              {vehicle.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </Card>

          {/* Details Grid */}
          <h3 className="font-semibold text-lg px-1">Vehicle Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="flex flex-col gap-1 p-4">
              <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                <Info size={16} />
                <span className="text-xs font-medium uppercase">Type</span>
              </div>
              <p className="font-semibold capitalize">{vehicle.type}</p>
            </Card>

            <Card className="flex flex-col gap-1 p-4">
              <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                <Calendar size={16} />
                <span className="text-xs font-medium uppercase">Year</span>
              </div>
              <p className="font-semibold">{vehicle.year || 'N/A'}</p>
            </Card>

            <Card className="flex flex-col gap-1 p-4">
              <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                <Shield size={16} />
                <span className="text-xs font-medium uppercase">Insurance Exp.</span>
              </div>
              <p className={`font-semibold text-sm ${vehicle.insurance_expiry && new Date(vehicle.insurance_expiry) < new Date() ? 'text-[var(--danger)]' : ''}`}>
                {vehicle.insurance_expiry ? formatDate(vehicle.insurance_expiry) : 'Not Set'}
              </p>
            </Card>

            <Card className="flex flex-col gap-1 p-4">
              <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                <Wrench size={16} />
                <span className="text-xs font-medium uppercase">License Exp.</span>
              </div>
              <p className={`font-semibold text-sm ${vehicle.license_expiry && new Date(vehicle.license_expiry) < new Date() ? 'text-[var(--danger)]' : ''}`}>
                {vehicle.license_expiry ? formatDate(vehicle.license_expiry) : 'Not Set'}
              </p>
            </Card>
          </div>

          {/* Notes */}
          {vehicle.notes && (
            <Card>
              <h4 className="text-sm font-medium text-[var(--text-muted)] mb-2">Notes</h4>
              <p className="text-sm leading-relaxed">{vehicle.notes}</p>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => navigate(`/fuel/add?vehicle_id=${vehicle.id}`)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)] text-[var(--text-main)] font-medium hover:bg-[var(--bg-surface-hover)] transition-colors"
            >
              <Droplet size={18} className="text-[var(--warning)]" />
              Log Fuel
            </button>
            <button
              onClick={() => navigate(`/maintenance/add?vehicle_id=${vehicle.id}`)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)] text-[var(--text-main)] font-medium hover:bg-[var(--bg-surface-hover)] transition-colors"
            >
              <Wrench size={18} className="text-[var(--primary)]" />
              Log Service
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--primary)] text-[var(--primary)] font-medium hover:bg-[var(--primary-light)] transition-colors"
            >
              <Edit size={18} />
              Edit Vehicle
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--danger)] text-[var(--danger)] font-medium hover:bg-[var(--danger-light)] transition-colors"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Vehicle"
        message={`Are you sure you want to delete ${vehicle.reg_number}? All associated records will remain but the vehicle will be removed.`}
        confirmLabel="Delete Vehicle"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={isDeleting}
      />
    </>
  );
};
