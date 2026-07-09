"use client";

import { useOrders } from "@/hooks/useOrders";
import { ORDER_STATUS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/date";

const STATUS_CLASS = {
  [ORDER_STATUS.SUCCESS]: "order-status-success",
  [ORDER_STATUS.PENDING]: "order-status-pending",
  [ORDER_STATUS.FAILED]: "order-status-failed",
};

export default function OrderTable({ initialOrders }) {
  const { orders, simulatePayment, loadingId, error } = useOrders(initialOrders);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Order History</h1>
        <p>View your past orders and order delivery statuses.</p>
      </div>

      <div className="dashboard-section">
        {error && (
          <p style={{ color: "#dc2626", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h4>No Orders Placed</h4>
            <p>Refill orders will be automatically generated and appear here on your refill dates.</p>
          </div>
        ) : (
          <div className="order-table-wrapper">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Medicine</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const medicineName =
                    order.items?.[0]?.medicine?.name ||
                    order.subscription?.medicine?.name ||
                    "Medicine";
                  const isPending = order.status === ORDER_STATUS.PENDING;
                  const isLoading = loadingId === order.id;

                  return (
                    <tr key={order.id}>
                      <td style={{ fontFamily: "monospace", color: "var(--color-text-muted)" }}>
                        {order.id.substring(0, 8)}...
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td><strong>{medicineName}</strong></td>
                      <td>₹{order.totalAmount}</td>
                      <td>
                        <span className={`order-status ${STATUS_CLASS[order.status] || ""}`}>
                          ● {order.status}
                        </span>
                      </td>
                      <td>
                        {isPending ? (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              disabled={isLoading}
                              onClick={() => simulatePayment(order.id, "success")}
                              className="btn btn-primary btn-sm"
                            >
                              {isLoading ? "..." : "Simulate Success"}
                            </button>
                            <button
                              disabled={isLoading}
                              onClick={() => simulatePayment(order.id, "failure")}
                              className="btn btn-danger-outline btn-sm"
                            >
                              {isLoading ? "..." : "Simulate Failure"}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}