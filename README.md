# OneClickPix_Server

## Description
This project is intended to function as a server to recieve orders from the related OneClickPix iOS app. It contains logic and database APIs to store product offering info, orders, user data, shopping carts, and in-app content in MongoDB.

OneClickPix is a photo ordering service provided by D&M imaging, and therefore this application is required to handle order data along with image file transfers. It also serves product offering information along with sample images of products, authenticates users, and stores shopping carts as session info.

## Status
This project is currently in development, and being developed alongside the client-side application. Most of the API routes are completed, but will need to be updated as the client application is developed. Some automated testing is in place but needs to be augmented.

## Roadmap
### Orders
Functionality will need to be added to move orders from the cart to the orders database. The current 'orders' routes will save orders, but were not designed to work with the shopping cart, and therefore will need to be modified.

A system of order confirmation (such as confirmation emails) will need to be added as well.

### Payments
Upon accepting orders, payment authorizations will need to verified and customers will need to be billed.

### User Registration and Accounts
User accounts need to be improved; current implementation simply offers a JSON Web Token upon registration or authentication. Functionality will need to be added to make tokens expire and redirect to authentication, and also offer a way to recover account username and password.
