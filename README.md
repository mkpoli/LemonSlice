# LemonSlice

[![Project Status: Concept – Minimal or no implementation has been done yet, or the repository is only intended to be a limited example, demo, or proof-of-concept.](https://www.repostatus.org/badges/latest/concept.svg)](https://www.repostatus.org/#concept)

Personal stats tracker and replay analyzer for Strinova.

## Development

### Preparation

#### Environment variables

Make `.env.local` and `.env.production` files in the root of the project and add variables. Some are database credentials, some are keys that need to be generated.

### Running in dev mode

```bash
bun dev
```

### Build and Preview

```bash
bun build && bun preview
```

### Deploy

```bash
bun deploy
```

It will build the project and deploy it to Cloudflare Workers.
