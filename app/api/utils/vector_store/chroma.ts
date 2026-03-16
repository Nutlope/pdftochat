import {
  CloudClient,
  Schema,
  VectorIndexConfig,
  SparseVectorIndexConfig,
  K,
  Search,
  Knn,
  Rrf,
  type Collection,
  type Metadata,
} from 'chromadb';
import { ChromaCloudSpladeEmbeddingFunction } from '@chroma-core/chroma-cloud-splade';
import {
  ChromaCloudQwenEmbeddingFunction,
  ChromaCloudQwenEmbeddingModel,
} from '@chroma-core/chroma-cloud-qwen';
import { BaseRetriever, type BaseRetrieverInput } from '@langchain/core/retrievers';
import type { Callbacks } from '@langchain/core/callbacks/manager';
import { Document } from '@langchain/core/documents';
import type { CallbackManagerForRetrieverRun } from '@langchain/core/callbacks/manager';

/**
 * Chroma metadata only supports flat values: string, number, boolean, or
 * typed arrays of those. LangChain document loaders (e.g. PDFLoader) attach
 * nested objects, so we strip any unsupported values.
 */
function sanitizeMetadata(meta: Record<string, unknown>): Metadata {
  const clean: Metadata = {};
  for (const [key, value] of Object.entries(meta)) {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      clean[key] = value;
    } else if (value === null || value === undefined) {
      // skip nulls
    } else if (Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === typeof value[0])) {
      if (typeof value[0] === 'string') clean[key] = value as string[];
      else if (typeof value[0] === 'number') clean[key] = value as number[];
      else if (typeof value[0] === 'boolean') clean[key] = value as boolean[];
    } else {
      clean[key] = JSON.stringify(value);
    }
  }
  return clean;
}

// Chroma collection names: 3-512 chars, alphanumeric + hyphens, start/end alphanumeric
function collectionName(docId: string): string {
  return `doc-${docId}`;
}

function createChromaClient(): CloudClient {
  return new CloudClient({
    tenant: process.env.CHROMA_TENANT!,
    database: process.env.CHROMA_DATABASE!,
    apiKey: process.env.CHROMA_API_KEY!,
  });
}

function createDenseEmbeddingFunction(): ChromaCloudQwenEmbeddingFunction {
  return new ChromaCloudQwenEmbeddingFunction({
    model: ChromaCloudQwenEmbeddingModel.QWEN3_EMBEDDING_0p6B,
    task: 'retrieval',
    apiKeyEnvVar: 'CHROMA_API_KEY',
  });
}

function createCollectionSchema(): Schema {
  const schema = new Schema();

  // Dense embedding index (Qwen) — auto-generates embeddings from document text
  schema.createIndex(
    new VectorIndexConfig({
      sourceKey: K.DOCUMENT,
      embeddingFunction: createDenseEmbeddingFunction(),
    }),
  );

  // Sparse embedding index (SPLADE) — keyword-based retrieval
  const sparseEf = new ChromaCloudSpladeEmbeddingFunction({
    apiKeyEnvVar: 'CHROMA_API_KEY',
  });
  schema.createIndex(
    new SparseVectorIndexConfig({
      sourceKey: K.DOCUMENT,
      embeddingFunction: sparseEf,
    }),
    'sparse_embedding',
  );

  return schema;
}

async function getOrCreateDocCollection(docId: string): Promise<Collection> {
  const client = createChromaClient();
  return client.getOrCreateCollection({
    name: collectionName(docId),
    schema: createCollectionSchema(),
  });
}

/**
 * A LangChain-compatible retriever backed by Chroma Cloud hybrid search.
 * Uses RRF to combine dense (Qwen) and sparse (SPLADE) rankings.
 */
export class ChromaRetriever extends BaseRetriever {
  lc_namespace = ['chroma', 'retrievers', 'ChromaRetriever'];

  private docId: string;
  private topK: number;

  constructor(docId: string, topK = 4, fields?: BaseRetrieverInput) {
    super(fields);
    this.docId = docId;
    this.topK = topK;
  }

  async _getRelevantDocuments(
    query: string,
    _runManager?: CallbackManagerForRetrieverRun,
  ): Promise<Document[]> {
    const collection = await getOrCreateDocCollection(this.docId);

    const hybridRank = Rrf({
      ranks: [
        // Dense semantic search via Chroma Cloud Qwen
        Knn({ query, returnRank: true, limit: 50, default: 1000 }),
        // Sparse keyword search via Chroma Cloud SPLADE
        Knn({ query, key: 'sparse_embedding', returnRank: true, limit: 50, default: 1000 }),
      ],
      weights: [0.7, 0.3],
      k: 60,
    });

    const search = new Search()
      .rank(hybridRank)
      .limit(this.topK)
      .select(K.DOCUMENT, K.METADATA);

    const results = await collection.search(search);
    const rows = results.rows()[0] ?? [];

    return rows.map((row) =>
      new Document({
        pageContent: row.document ?? '',
        metadata: (row.metadata as Record<string, unknown>) ?? {},
      }),
    );
  }
}

/**
 * A thin wrapper providing LangChain-compatible `addDocuments()` for ingestion.
 * Documents are stored in a per-document Chroma collection; Qwen + SPLADE
 * embeddings are generated automatically by Chroma Cloud at index time.
 */
export class ChromaVectorStore {
  private docId: string;

  constructor(docId: string) {
    this.docId = docId;
  }

  async addDocuments(docs: Document[]): Promise<void> {
    const collection = await getOrCreateDocCollection(this.docId);

    const ts = Date.now();
    await collection.add({
      ids: docs.map((_, i) => `${this.docId}_chunk_${i}_${ts}`),
      documents: docs.map((d) => d.pageContent),
      metadatas: docs.map((d) => sanitizeMetadata(d.metadata)),
    });
  }

  asRetriever(options?: { callbacks?: Callbacks }): ChromaRetriever {
    return new ChromaRetriever(this.docId, 4, { callbacks: options?.callbacks });
  }
}

export function loadChromaStore(docId: string): { vectorstore: ChromaVectorStore } {
  return { vectorstore: new ChromaVectorStore(docId) };
}

export async function deleteChromaCollection(docId: string): Promise<void> {
  const client = createChromaClient();
  await client.deleteCollection({ name: collectionName(docId) });
}
