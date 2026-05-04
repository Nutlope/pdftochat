import type { Embeddings } from '@langchain/core/embeddings';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import {
  BaseRetriever,
  type BaseRetrieverInput,
} from '@langchain/core/retrievers';
import type { Callbacks } from '@langchain/core/callbacks/manager';
import { Document } from '@langchain/core/documents';
import type { CallbackManagerForRetrieverRun } from '@langchain/core/callbacks/manager';

export async function loadPineconeStore({
  namespace,
  embeddings,
}: {
  namespace: string;
  embeddings: Embeddings;
}) {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? '',
  });

  const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';
  const index = pinecone.index(PINECONE_INDEX_NAME);

  const vectorstore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace,
    textKey: 'text',
  });

  return { vectorstore };
}

/**
 * Pinecone retriever scoped to one or more document namespaces. Each
 * namespace is queried in parallel; results merge by reciprocal-rank
 * fusion. Single-namespace path matches the original behaviour exactly.
 */
class PineconeMultiRetriever extends BaseRetriever {
  lc_namespace = ['pinecone', 'retrievers', 'PineconeMultiRetriever'];

  private documentIds: string[];
  private embeddings: Embeddings;
  private topK: number;

  constructor(
    documentIds: string[],
    embeddings: Embeddings,
    topK = 4,
    fields?: BaseRetrieverInput,
  ) {
    super(fields);
    this.documentIds = documentIds;
    this.embeddings = embeddings;
    this.topK = topK;
  }

  async _getRelevantDocuments(
    query: string,
    _runManager?: CallbackManagerForRetrieverRun,
  ): Promise<Document[]> {
    const perNs = Math.max(
      this.topK,
      Math.ceil((this.topK * 2) / this.documentIds.length),
    );
    const lists = await Promise.all(
      this.documentIds.map(async (namespace) => {
        const { vectorstore } = await loadPineconeStore({
          namespace,
          embeddings: this.embeddings,
        });
        return vectorstore.similaritySearch(query, perNs);
      }),
    );

    if (this.documentIds.length === 1) return lists[0].slice(0, this.topK);
    return rrfMerge(lists, this.topK);
  }
}

function rrfMerge(lists: Document[][], topK: number, k = 60): Document[] {
  const scored = new Map<string, { doc: Document; score: number }>();
  for (const list of lists) {
    list.forEach((doc, rank) => {
      const key =
        (doc.metadata as any)?.docstore_document_id +
        '::' +
        doc.pageContent.slice(0, 80);
      const score = 1 / (k + rank + 1);
      const prior = scored.get(key);
      if (prior) prior.score += score;
      else scored.set(key, { doc, score });
    });
  }
  return Array.from(scored.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.doc);
}

export async function loadPineconeRetriever({
  documentIds,
  embeddings,
  callbacks,
}: {
  documentIds: string[];
  embeddings: Embeddings;
  callbacks?: Callbacks;
}): Promise<{ retriever: PineconeMultiRetriever; mongoDbClient: undefined }> {
  const retriever = new PineconeMultiRetriever(documentIds, embeddings, 4, {
    callbacks,
  });
  return { retriever, mongoDbClient: undefined };
}
