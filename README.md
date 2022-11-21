# Vehicle Detector Agent Webhook Middleware

Express middleware for parsing Vehicle Detector Agent webhook requests and verifying their signature.

## How to Install

```sh
npm install --save @arcloud/vehicle-detector-agent-webhook-middleware
```

## Usage

### TypeScript

```typescript
import express, { Express, Request, Response } from 'express';
import { WebhookEvent, webhookSignatureValidator } from "vehicle-detector-agent-webhook-middleware";

const app: Express = express();
const port = 8080;

const signatureValidator = webhookSignatureValidator({
  algorithm: "RS256",
  publicKeyPath: "/path/to/RS256.public.pem"
});

app.get('/', (req: Request, res: Response) => {
  res.send('OK');
});

// This endpoint uses the middleware - requests with an invalid signature 
// will be rejected.
app.post('/webhook', signatureValidator, (req: Request, res: Response) => {
  const event: WebhookEvent = req.body; // req.body contains the parsed event
  console.log("Detected At: ", event.detectedAt);
  console.log("Unicode Text:", event.event.plate.unicodeText);
  res.send('OK');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
```

### JavaScript

```javascript
const express = require("express");
const { webhookSignatureValidator } = require("vehicle-detector-agent-webhook-middleware");

const app = express();
const port = 8080;

const signatureValidator = webhookSignatureValidator({
  algorithm: "RS256",
  publicKeyPath: "/path/to/RS256.public.pem"
});

// This endpoint uses the middleware - requests with an invalid signature 
// will be rejected.
app.post('/webhook', signatureValidator, (req, res) => {
  const event = req.body; // req.body contains the parsed event
  console.log("Detected At: ", event.detectedAt);
  console.log("Unicode Text:", event.event.plate.unicodeText);
  res.send('OK');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
```