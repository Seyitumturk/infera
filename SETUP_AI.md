# 🚀 AI-Powered Graph RAG Setup

## ✅ FIXED: Server-Side API Architecture

Your API keys are now secure on the server! No more client-side exposure.

## Required API Keys

Create a `.env.local` file in your project root:

```bash
# Anthropic Claude for semantic analysis (server-side only)
ANTHROPIC_API_KEY=sk-ant-api03-...

# OpenAI for vector embeddings (server-side only)
OPENAI_API_KEY=sk-proj-...
```

## Getting API Keys

### Anthropic Claude API
1. Go to https://console.anthropic.com/
2. Create account and get API key
3. Copy `ANTHROPIC_API_KEY`

### OpenAI API  
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy `OPENAI_API_KEY`

## Architecture

```
Client → API Routes → AI Services
├── /api/ai/analyze    (Claude analysis)
├── /api/ai/embeddings (OpenAI vectors)
└── /api/ai/roadmap    (Claude strategy)
```

**Secure**: API keys stay on server, never exposed to browser

## Cost Estimate

- **Claude Sonnet 4**: ~$0.01 per analysis
- **OpenAI Embeddings**: ~$0.001 per solution
- **Total per roadmap**: ~$0.15-0.30

## How It Works

1. **Client** sends user input to `/api/ai/analyze`
2. **Claude** analyzes semantic intent server-side
3. **Vector search** finds similar solutions via `/api/ai/embeddings`
4. **AI roadmap** generated via `/api/ai/roadmap`
5. **Secure** - no API keys in browser

## Test It

1. Add API keys to `.env.local`
2. Run `npm run dev`
3. Complete assessment
4. Check Network tab for API calls to `/api/ai/*`

🎯 **Real AI-powered recommendations with secure server-side processing!**