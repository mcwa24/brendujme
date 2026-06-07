# Render Web Service — Next.js + Playwright (promotions scan)
# Base image includes Chromium and OS libs required by Playwright.
FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=10000

COPY package.json package-lock.json ./

# playwright + tsx are devDependencies but required at runtime for scan-promotions
RUN npm ci --include=dev

COPY . .

# promotions:detect uses `tsx --env-file=.env.local`; Render injects env at runtime.
RUN touch .env.local

RUN npm run build

EXPOSE 10000

CMD ["npm", "start"]
