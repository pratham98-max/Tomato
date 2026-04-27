import React from 'react';
import './OrderStatusTimeline.css';

const statusSteps = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' }
];

const OrderStatusTimeline = ({ currentStatus }) => {
  const currentIdx = statusSteps.findIndex(s => s.key === currentStatus);

  return (
    <div className="status-timeline">
      {statusSteps.map((step, idx) => (
        <div key={step.key} className={`timeline-step ${idx <= currentIdx ? 'completed' : ''} ${idx === currentIdx ? 'current' : ''}`}>
          <div className="timeline-dot">
            {idx <= currentIdx ? '✓' : idx + 1}
          </div>
          <div className="timeline-label">{step.label}</div>
          {idx < statusSteps.length - 1 && <div className={`timeline-line ${idx < currentIdx ? 'active' : ''}`} />}
        </div>
      ))}
    </div>
  );
};

export default OrderStatusTimeline;
