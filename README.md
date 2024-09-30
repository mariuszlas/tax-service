# Tax Service

Table of Contents

-   [Overview](#overview)
-   [Endpoints](#endpoints)
-   [Local Development](#local-development)
-   [Design](#design)
-   [Future Considerations](#future-considerations)

## Overview

This project implements a RESTful APIs for managing sales transactions and tax calculations in a structured and scalable manner. It is built using Node.js and Express with a PostgreSQL database for storing sales, amendments, and tax-related data.

The core endpoints manage sales events (sales transactions and tax payments), calculate tax positions, and handle amendments to prior sales records. The system is designed to ensure data integrity, accurate tax calculations, and efficient performance even with increasing data volume over time.

The service is currently deployed to [here](https://tax-service.up.railway.app) and the documentation can be accessed [here](https://tax-service.up.railway.app/api-docs)

## Endpoints

-   GET `/health`: A basic health check endpoint for monitoring service availability.
-   POST `/transactions`: Adding sales and tax payments.
-   PATCH `/sale`: Adding or updating sales items, with amendments tracked over time.
-   GET `/tax-position`: Calculating the tax position at any given point in time.

## Local Development

### Requirements

-   Node.js v20
-   Docker and Docker Compose (to run the PostgesSQL databse)

### Instructions

1. Clone the repo and navigate to the root directory.
2. Run `npm install` to install project dependencies.
3. Start the postgres database server by running `docker compose up` (make sure the Docker deamon is running).
4. In a separate terminal run `npm run migrate` to create database tables. This step should be done only when running the database for the **first time** or if the Docker volume has been removed. The Docker container will save data in a volume so that it persists when the container is stopped.
5. Run `npm run dev` to start the development server. The tax service should be accessible on `localhost` port `3000`. The Swagger documentation can be accessed at `/api-docs`.

### Unit Tests

Unit tests can be run with `npm test`, which also includes coverage report

### Databse Browser

Since the project uses Drizzle ORM, the Drizzle Studio can be used to view and interact with the database. Run `npm run drizzle-studio` in a separte terminal and visit `https://local.drizzle.studio` in your web browser.

## Design

### Input Validation & Documentation

The endpoints are based on the API specification document (in OpenAPI Specification format) which provides an easy way to describe the structure including available endpoints and operations on each endpoint, names and types of reques and query parameters and structures of request bodies and responses. It intergates with a validator which validates every request based on the API specification. It also serves as a source of documention for the Swagger UI making sure that documentation never gets out of sync with the changes in API.

### Separation of Concerns

The architecture splits the responsibilities between the database layer and the application layer. SQL is used for basic aggregation and querying, while complex tax calculations are handled in the application layer. The reason for it is that I think it is more maintainable and flexible to keep the amendment and tax calculation logic in TypeScript rather using a signle, very complex SQL query, even if it may scarifice some performance gained by doing everything in database layer.

### Database Schema

I chose a relational database (PostgreSQL) due to the structured nature of the data and the need for atomic transactions and data integrity. Data is modeled into 4 tables:

-   **Sale Events** - invoices with a unique invoice id submitted in the `/transactions` enpoint.
-   **Sale Items** - stores items that are submitted in a sale event. It references invoice id and has must have a unique composite index which is a combination of item id and invoice id so that an invoice cannot have multiple items with the same id.
-   **Tax Payments** - stores tax payment events.
-   **Sale Amendments** - stores any amendments made to sale items. If an item's cost or tax rate is amended, this table logs the changes. Tracking these changes separately allows reconstructing the tax position accurately at any point in time.

<img src="https://github.com/user-attachments/assets/f3acee8b-f8e3-449b-844c-66525a26dd70" width="1050" />

### Amendments Handling

The amendments to sales are handled by creating a new record for every amendment, rather than only modifying the original sale item. When retrieving sales, the cost and tax rate amendments are applied in the application layer. This approach preserves a full history of items's cost and tax rate ensuring tracebility.

### Handling Monetary Values

Since the tax calculation occurs in the application layer and JavaScript has only one numeric data type, I chose to use `decimal.js` library to ensure monetary values are handled as decimals and the caluclations always return integer pennies to ensure accuracy and avoid possible floating-point precision errors.

### Error Handling & Logging

The service has an error handling middleware to ensure consitent and user-firendly responses. All errors including the ones in middleware and the ones thrown in handlers are logged in standardised format including context specific iformation if applicable (e.g. invoice id if adding a new sale event fails). Additionally, all HTTP requests are logged.

### Testing

Handlers for all endpoints are unit tested to ensure the correct logic based on differnt request data. All utility functions for financial calculations are also covered by unit tests.

## Future Considerations

-   **API Versioning**
-   **Caching**: if the data doesn't change frequently, caching could be implemented for `/tax-position` to avoid redundant calulations
-   **Security**: adding authentication and implementing bot detection and rate limiting to prevent abuse
