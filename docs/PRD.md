# Product Requirements Document (PRD)

# PharmEasy Auto-Refill Subscription System

**Version:** 1.0  
**Team:** S135 – Stellar  
**Sprint:** Sprint 1  
**Prepared By:** Team S135 – Stellar

---

# 1. Executive Summary

The **PharmEasy Auto-Refill Subscription System** is designed to automate recurring medicine purchases for users who require medications on a regular basis. Instead of manually placing the same order every few weeks, users can subscribe to medicines and choose a refill schedule (Daily, Weekly, or Monthly).

On the scheduled refill date, the system automatically generates an order, attempts payment using a saved payment method (simulated), retries failed payments up to three times, and notifies users before and after each refill process.

The objective is to simplify recurring medicine purchases, improve medication adherence, and provide a seamless subscription experience.

---

# 2. Business Problem Statement

Many PharmEasy customers rely on medicines that need to be purchased repeatedly, especially those managing chronic illnesses such as diabetes, hypertension, thyroid disorders, or long-term supplements.

Currently, users must remember to manually reorder these medicines whenever they run out. Missing a refill can interrupt treatment, while repeated manual ordering creates unnecessary effort and inconvenience.

Additionally, there is no automated mechanism to retry failed payments or notify users before scheduled refills.

The proposed solution is an automated subscription system that:

- Eliminates manual repeat ordering.
- Automatically generates refill orders.
- Retries failed payments.
- Notifies users before every scheduled refill.

---

# 3. Business Impact

## Operational Impact

- Reduces repetitive manual ordering.
- Automates recurring refill workflows.
- Minimizes manual intervention in the ordering process.

## Customer Impact

- Improves medication adherence.
- Reduces the chances of missed refills.
- Provides a seamless recurring purchasing experience.

## Business Impact

- Encourages repeat purchases.
- Improves customer retention.
- Increases recurring revenue through subscriptions.

---

# 4. Stakeholders

| Stakeholder | Responsibility |
|-------------|----------------|
| Customers | Create and manage medicine subscriptions |
| Product Team | Define product requirements and workflows |
| Engineering Team | Design, build, and maintain the platform |
| PharmEasy Operations | Ensure recurring orders are processed correctly |
| Customer Support | Resolve subscription and payment-related issues |

---

# 5. Objectives

## Business Objectives

- Increase customer retention.
- Increase recurring medicine purchases.
- Improve subscription adoption.
- Reduce manual repeat ordering.

## User Objectives

- Never forget medicine refills.
- Easily manage recurring subscriptions.
- Receive reminders before every scheduled refill.
- Experience uninterrupted recurring medicine purchases.

---

# 6. Success Metrics (KPIs)

| KPI | Target |
|------|--------|
| Subscription Creation Success Rate | ≥95% |
| Automatic Order Generation | 100% of eligible subscriptions |
| Payment Retry Attempts | Maximum 3 retries |
| Notification Delivery | Notification sent before every scheduled refill |
| Average Subscription Setup Time | Less than 2 minutes |

---

# 7. Target Users

## Primary Users

- Patients with chronic illnesses
- Senior citizens
- Working professionals
- Caregivers managing medicines for family members

## Secondary Users

- Users purchasing recurring health supplements
- Parents purchasing recurring medicines for children

---

# 8. Scope

## In Scope

- User Registration & Login
- Medicine Catalogue
- Medicine Search
- Create Subscription
- Daily / Weekly / Monthly Refill Plans
- Edit Subscription
- Pause Subscription
- Resume Subscription
- Cancel Subscription
- Automatic Order Generation
- Simulated Payment Processing
- Payment Retry Mechanism
- Notifications
- Dashboard
- Order History

## Out of Scope

- Real payment gateway integration
- Live pharmacy inventory
- Delivery tracking
- Refund management
- Doctor consultation
- Coupons and discounts
- Multi-language support

---

# 9. User Stories

## Authentication

- As a user, I want to register so that I can manage my subscriptions.
- As a user, I want to securely log in so that my account remains protected.

## Medicines

- As a user, I want to browse medicines so that I can subscribe to recurring medications.
- As a user, I want to search medicines so that I can quickly find the medicines I need.

## Subscription

- As a user, I want to subscribe to a medicine so that I never forget to reorder it.
- As a user, I want to select a Daily, Weekly, or Monthly schedule so that deliveries match my prescription.
- As a user, I want to edit my subscription so that I can update my refill preferences.
- As a user, I want to pause my subscription so that I can temporarily stop deliveries.
- As a user, I want to resume my subscription so that deliveries continue without creating a new subscription.
- As a user, I want to cancel my subscription so that future refills stop completely.

## Orders

- As a user, I want orders to be generated automatically so that I do not have to place repeat orders manually.
- As a user, I want to view my order history so that I can track previous purchases.

## Notifications

- As a user, I want reminders before every scheduled refill so that I know an order is about to be placed.
- As a user, I want payment status notifications so that I know whether my payment succeeded or failed.

---

# 10. Functional Requirements

## 10.1 Authentication Module

The system shall allow users to:

- Register
- Login
- Logout
- Access protected routes using JWT authentication.

---

## 10.2 Medicine Module

The system shall allow users to:

- Browse medicines.
- Search medicines.
- View medicine details.

---

## 10.3 Subscription Module

The system shall allow users to:

- Create subscriptions.
- Select refill frequency.
- View subscriptions.
- Edit subscriptions.
- Pause subscriptions.
- Resume subscriptions.
- Cancel subscriptions.

---

## 10.4 Scheduler Module

The scheduler shall:

- Execute automatically at scheduled intervals.
- Check all active subscriptions.
- Identify subscriptions due for refill.
- Generate a new order.
- Attempt payment automatically.
- Update the next refill date after successful order generation.

---

## 10.5 Payment Module

The payment module shall:

- Simulate payment processing.
- Mark payments as successful or failed.
- Retry failed payments up to **three times**.
- Mark the order as failed after the final unsuccessful attempt.
- Notify users about payment outcomes.

---

## 10.6 Notification Module

The system shall notify users:

- 24 hours before every scheduled refill.
- When payment succeeds.
- When payment fails.
- When all retry attempts are exhausted.

---

## 10.7 Dashboard

The dashboard shall display:

- Active subscriptions.
- Upcoming refill dates.
- Recent orders.
- Subscription status.
- Notifications.

---

# 11. Non-Functional Requirements

## Performance

- Average API response time should remain below **500 ms** for standard operations.

## Security

- Passwords shall be securely hashed.
- Authentication shall use JWT.
- Protected routes shall prevent unauthorized access.

## Reliability

- The scheduler shall execute reliably without skipping eligible subscriptions.
- Retry logic shall recover from temporary payment failures.

## Scalability

- The application shall support thousands of users and subscriptions.

## Maintainability

- Code shall follow a modular architecture.
- APIs shall be reusable and well documented.

---

# 12. Assumptions

- Payments are simulated.
- Users have a saved payment method (simulated).
- Medicine stock is always available.
- Each subscription contains one medicine.
- Every user has one delivery address.
- Notifications are simulated within the application.

---

# 13. Constraints

## Technology Stack

- Next.js
- PostgreSQL
- Prisma ORM
- GitHub Actions
- Google Cloud Platform

## Project Constraints

- Development must be completed within the Sprint timeline.
- No real third-party integrations will be implemented.

---

# 14. User Workflow

```text
User Registers / Logs In
        │
        ▼
Browse Medicines
        │
        ▼
Select Medicine
        │
        ▼
Choose Refill Frequency
(Daily / Weekly / Monthly)
        │
        ▼
Subscription Created
        │
        ▼
24-Hour Reminder Sent
        │
        ▼
Scheduler Runs
        │
        ▼
Generate Order
        │
        ▼
Attempt Payment
        │
   ┌────┴────┐
   │         │
Success   Failure
   │         │
   ▼         ▼
Notify     Retry (Max 3)
   │         │
   ▼         ▼
Order     Notify Failure
Completed
```

---

# 15. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Scheduler fails to execute | Medium | High | Logging and scheduler monitoring |
| Payment repeatedly fails | Medium | Medium | Retry three times, then notify the user |
| Invalid user input | Medium | Medium | Validate requests using Zod |
| Unauthorized access | Low | High | JWT authentication and protected APIs |
| Incorrect scheduler logic | Low | High | Unit and integration testing |

---

# 16. Acceptance Criteria

The project will be considered complete when:

- Users can register and log in successfully.
- Users can browse and search medicines.
- Users can create, edit, pause, resume, and cancel subscriptions.
- Orders are automatically generated based on subscription schedules.
- Payments are simulated successfully.
- Failed payments retry up to three times.
- Notifications are generated before scheduled refills and after payment events.
- The dashboard displays subscriptions, orders, and notifications.
- APIs return expected responses.
- Core user journeys function without manual intervention.

---

# 17. Future Enhancements

- Real payment gateway integration (Stripe/Razorpay)
- SMS and Email notifications
- WhatsApp reminders
- Live medicine inventory
- Family medicine management
- Delivery tracking
- Multiple payment methods
- AI-based refill recommendations
- Subscription analytics dashboard
- Multiple delivery addresses

---

# 18. Open Questions

- Should one subscription contain multiple medicines or only one?
- How far in advance should reminder notifications be sent?
- What should happen if a subscribed medicine becomes unavailable?
- Should users be able to skip a single refill without cancelling the subscription?
- Should users be able to change their payment method after creating a subscription?

---

# 19. Conclusion

The **PharmEasy Auto-Refill Subscription System** provides a reliable solution for users who depend on recurring medicine purchases. By combining subscription management, automated order generation, payment retry handling, and timely notifications, the platform reduces manual effort, improves medication adherence, and delivers a smoother user experience.

This PRD serves as the shared agreement between stakeholders, designers, and developers, ensuring the team builds the right product within the defined scope and Sprint timeline.