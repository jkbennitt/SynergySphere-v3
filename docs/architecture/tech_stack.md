
# Tech Stack for Synergy Sphere

> **Version 1.0** | **Technology Stack Specifications**

## Overview

This document outlines the updated technology stack for the Synergy Sphere project. 

These updates ensure that the entire project remains free, open-source, and accessible for collaboration.

## Tech Stack Components

### Frontend

- **React.js**:
  - For building a dynamic and interactive user interface.
- **Three.js**:
  - For rendering the 3D globe in the Geoscope module.
- **Axios**:
  - For making HTTP requests to the backend API.

### Backend

- **Node.js**:
  - Runtime environment for server-side code.
- **Express.js**:
  - Web framework for building the API.
- **MongoDB**:
  - NoSQL database for storing application data (e.g., user profiles, forum posts, simulation results).
- **Mongoose**:
  - ODM (Object Data Modeling) library for MongoDB, simplifying database interactions.
- **Passport.js**:
  - Authentication middleware for Node.js (open-source, MIT license).
- **passport-jwt**:
  - Passport strategy for authenticating with JSON Web Tokens (JWT).
- **jsonwebtoken**:
  - Library for generating and verifying JWTs.

### Authentication

- **Passport.js with JWT**:
  - Provides secure, token-based authentication, ensuring validated unique identities.
  - Replaces Firebase Authentication to maintain a fully open-source stack.

### Data Sources

- **Public APIs**:
  - For real-time and historical data (e.g., NASA for climate data, World Bank for population statistics, OpenWeather for temperature data).

### Version Control

- **GitHub**:
  - For source code management, version control, and open-source collaboration.

### Hosting and Deployment

- **Replit**:
  - Online IDE and hosting platform, ideal for collaborative development and educational purposes.
  - Replaces Vercel to leverage Replit's integrated environment.

### Additional Tools

- **cors**:
  - For handling Cross-Origin Resource Sharing, ensuring secure communication between frontend and backend.

This tech stack ensures that your Synergy Sphere project remains fully open-source, secure, and collaborative, while leveraging tools that are beginner-friendly and scalable.

---

## 📝 Change Log

| **Version** | **Date** | **Changes** |
|-------------|----------|-------------|
| **1.0** | 2025-01-27 | Initial tech stack specification with fully open-source components, Passport.js authentication, and Replit hosting integration. |
