# Hotel QR Menu and Ordering System

## 1. Purpose

The system provides a mobile-friendly digital menu for hotel or restaurant
customers. A customer scans a QR code, views available menu items, adds items
to a cart, and submits an order using a room or table number. Hotel staff
manage the menu and process orders through protected dashboards.

## 2. Version 1 Scope

### Customer

- Open the menu from a QR-code URL.
- View the hotel name and menu categories.
- View item names, descriptions, prices, images, and availability.
- Filter the menu by category.
- Add, remove, and change quantities in a cart.
- Enter a room number or table number.
- Add optional customer notes.
- Submit an order without creating an account.
- Receive an order reference after submission.

### Administrator

- Sign in securely.
- Create, edit, deactivate, and reorder categories.
- Create, edit, deactivate, and reorder menu items.
- Set item descriptions, prices, images, categories, and availability.
- View orders.
- Manage staff accounts and roles.

### Staff

- Sign in securely.
- View incoming orders and their details.
- See the room or table number and customer notes.
- Update order status.

### Excluded from Version 1

- Online payments.
- Customer accounts.
- Delivery.
- Loyalty features.
- Advanced analytics.
- Native mobile applications.

## 3. User Roles

| Role | Main permissions |
| --- | --- |
| Customer | Browse the menu and submit an order |
| Administrator | Manage the menu, users, and all orders |
| Kitchen staff | View and update food-order status |
| Service staff | View and complete customer orders |

## 4. Order Lifecycle

Orders use the following statuses:

```text
PENDING
ACCEPTED
PREPARING
READY
COMPLETED
REJECTED
CANCELLED
```

The server calculates the final order total from current menu data and stores
the item price at the time the order is created.

## 5. Core Data

The initial database design is expected to contain:

- Hotel or restaurant
- Category
- Menu item
- Order
- Order item
- User
- Role or role assignments

Menu items require a name, description, price, category, availability status,
and optional image reference. Orders require an order reference, room or table
number, ordered items, quantities, captured prices, total, status, and
timestamps.

## 6. QR Requirements

QR codes contain a menu URL rather than the menu data itself. The system must
support generating, displaying, downloading, and printing a QR code for the
customer menu. A later version may include a table or room identifier in the
URL.

## 7. Technology

- Frontend: React, Vite, and TypeScript
- Backend: Node.js, Express, and TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Interface: REST API
- Development environment: Windows and VS Code

## 8. Authentication and Security

- Customers do not require accounts in Version 1.
- Administrator and staff routes require authentication.
- Passwords must be hashed and never stored as plain text.
- Authorization must be enforced on the server for every protected operation.
- Request data must be validated on the server.
- Order totals and prices must not be trusted from the frontend.
- Database credentials and secrets must be stored in environment variables.
- Production deployment must use HTTPS.
- Authentication endpoints should be rate-limited.
- Uploaded or referenced images must be handled safely.

## 9. Quality Requirements

The application should be:

- Usable on current mobile browsers.
- Responsive on small screens.
- Accessible through keyboard and screen-reader-friendly controls where
  practical.
- Maintainable with clear separation between frontend, backend, and database
  concerns.
- Tested at the API, component, and end-to-end levels as the relevant features
  are implemented.

## 10. Implementation Sequence

1. Confirm project requirements.
2. Create the project folder.
3. Create the React frontend.
4. Create the Express backend.
5. Set up PostgreSQL.
6. Set up Prisma.
7. Design and migrate the database.
8. Build the customer menu.
9. Build the admin dashboard.
10. Connect frontend and backend.
11. Add menu images, categories, and prices.
12. Generate and test QR codes.
13. Add customer ordering.
14. Add staff and kitchen management.
15. Deploy after local testing is complete.

## 11. Step 1 Acceptance Criteria

Step 1 is complete when:

- The Version 1 scope is agreed.
- Customer, administrator, and staff responsibilities are understood.
- The order lifecycle is agreed.
- The initial data and security requirements are understood.
- No implementation work has been started ahead of the requirements.
