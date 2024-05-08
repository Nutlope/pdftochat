import { DocumentInterface } from '@langchain/core/documents';
import { ChatOpenAI } from '@langchain/openai';
import fs from 'fs';
import { Client } from 'langsmith';
import 'dotenv/config';
import { generateBaselineAnswer } from './generateFinalAnswer';

async function curateRawDataset() {
  const client = new Client();

  const runs = client.listRuns({
    projectName: 'pdftochat',
    filter: `and(eq(name, "RunnablePick"))`,
  });

  const data: Record<string, any>[] = [];
  const questionsSet = new Set<string>();
  let iters = 0;
  for await (const run of runs) {
    iters += 1;
    console.log('running iteration', iters);
    if (iters > 1000) {
      break;
    }
    const { input, chat_history, context } = run.inputs;
    if (
      !Array.isArray(chat_history) ||
      chat_history.length > 0 ||
      context.length === 0
    ) {
      continue;
    }
    if (questionsSet.has(input)) {
      continue;
    }
    questionsSet.add(input);
    data.push({
      id: run.id,
      ...run.inputs,
    });
    if (data.length > 250) {
      break;
    }
  }

  fs.writeFileSync('new-data.json', JSON.stringify(data, null, 2));
}

type Data = {
  id: string;
  input: string;
  context: Array<DocumentInterface>;
};

async function createDatasetWithAnswers() {
  if (!process.env.LS_DATASET_NAME) {
    throw new Error('LS_DATASET_NAME is required.');
  }
  const data: Array<Data> = JSON.parse(
    fs.readFileSync('new-data.json', 'utf-8'),
  );
  const model = new ChatOpenAI({
    model: 'gpt-4-turbo',
    temperature: 0,
  });

  const resultsPromise = data.map(async (d) => {
    const answer = await generateBaselineAnswer(
      {
        input: d.input,
        context: d.context,
      },
      model,
    );
    return {
      inputData: d,
      answer,
    };
  });

  const results = await Promise.all(resultsPromise);
  const client = new Client();
  const dataset = await client.createDataset(process.env.LS_DATASET_NAME);
  const inputs: Record<string, any>[] = [];
  const outputs: Record<string, any>[] = [];
  const sourceRunIds: string[] = [];
  results.map((r) => {
    const input = r.inputData;
    const output = {
      baselineAnswer: r.answer,
    };
    inputs.push(input);
    outputs.push(output);
    sourceRunIds.push(input.id);
  });
  await client.createExamples({
    inputs,
    outputs,
    datasetId: dataset.id,
    sourceRunIds,
  });
}
