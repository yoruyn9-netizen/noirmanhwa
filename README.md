# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Cloudinary CORS Configuration

During banner uploads, Cloudinary must allow requests from your deployed domain and local development origin.

In the Cloudinary dashboard, go to `Settings` → `Upload` → `CORS` and add the following entry:

```json
[
  {
    "origin": ["https://noirmanhwa.vercel.app", "http://localhost:3000"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "max_age_seconds": 3600
  }
]
```

After saving, retry the banner upload in the profile editor. If upload fails due to CORS, the UI will show a clear message telling you to add the allowed origins.
