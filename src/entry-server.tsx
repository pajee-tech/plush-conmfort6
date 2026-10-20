/**
 * Server-side rendering entry (used by server.ts).
 * Renders the storefront to real HTML so visitors and Google see content instantly
 * (faster LCP, better SEO). The browser then takes over with the normal React app.
 */
import React from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { StoreProvider, StoreBootData } from './context/StoreContext';
import { AppContent } from './App';

export async function render(url: string, bootData: StoreBootData): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <StoreProvider initialPath={url.split('?')[0]} bootData={bootData}>
      <AppContent />
    </StoreProvider>,
    // Keep finished content inline (no out-of-order streaming) so the footer never jumps (CLS = 0)
    { progressiveChunkSize: Number.MAX_SAFE_INTEGER }
  );
  const chunks: Buffer[] = [];
  for await (const chunk of prelude as any) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf-8');
}
