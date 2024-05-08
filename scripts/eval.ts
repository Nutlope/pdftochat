import { EvaluationResult, evaluate } from 'langsmith/evaluation';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';
import { StructuredTool } from '@langchain/core/tools';
import { Client, Example, Run } from 'langsmith';
import { RunnableLambda } from '@langchain/core/runnables';

import 'dotenv/config';
import { generateBaselineAnswer } from './generateFinalAnswer';
import { DocumentInterface } from '@langchain/core/documents';

const EVAL_CRITERIA = z.object({
  accuracy: z
    .enum(['1', '2', '3', '4'])
    .describe(
      'How accurate is the generated answer compared to the baseline and the provided context? 1 is highly accurate, and 4 is entirely inaccurate.',
    ),
  completeness: z
    .enum(['1', '2', '3', '4'])
    .describe(
      'How complete is the generated answer in addressing the question? Does it utilize the provided context well? 1 is very complete, and 4 is severely lacking.',
    ),
});

class EvaluationCriteriaTool extends StructuredTool {
  schema = EVAL_CRITERIA;

  description = 'Evaluate the quality of an answer based on a set of criteria.';

  name = 'Evaluation_Criteria';

  async _call(input: z.infer<typeof EVAL_CRITERIA>) {
    const averageScore =
      (Number(input.accuracy) + Number(input.completeness)) / 2;
    return JSON.stringify({
      score: averageScore,
    });
  }
}

/**
 * LLMs as a jury.
 * Use three LLMs (GPT-3.5, Claude 3 Haiku, and Llama 3 70B)
 * to evaluate the results of a run. Then, use the aggregated
 * results to determine the final score.
 */
async function jury(
  run: Run,
  example?: Example | undefined,
): Promise<EvaluationResult> {
  if (!example) {
    throw new Error('Example is required for this evaluator.');
  }
  if (!example.outputs?.baselineAnswer) {
    throw new Error('Baseline answer is required for this evaluator.');
  }
  if (!run.outputs?.generatedAnswer) {
    throw new Error('Generated answer is required for this evaluator.');
  }

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are tasked with evaluating the results of an answer to a users question.
Given the question, and a list of criteria to evaluate the answer on, provide fair scores for each criteria.
You should compare generated answers against the baseline answers.`,
    ],
    [
      'human',
      `<QUESTION>
{question}
</QUESTION>
    
<GENERATED_ANSWER>
{answer}
</GENERATED_ANSWER>

<BASELINE_ANSWER>
{baseline}
</BASELINE_ANSWER>

<BASELINE_CONTEXT>
{context}
</BASELINE_CONTEXT>`,
    ],
  ]);

  const tool = new EvaluationCriteriaTool();

  const openAIModel = new ChatOpenAI({
    model: 'gpt-3.5-turbo',
    temperature: 0,
  }).withStructuredOutput(tool);
  const openAIChain = prompt.pipe(openAIModel).pipe(tool);

  const anthropicModel = new ChatAnthropic({
    temperature: 0,
    model: 'claude-3-haiku-20240307',
  }).withStructuredOutput(
    tool.schema.describe(
      'Evaluate the quality of an answer based on a set of criteria.',
    ),
    {
      name: tool.name,
    },
  );
  const anthropicChain = prompt.pipe(anthropicModel).pipe(tool);

  // Proxy OpenAI class to TogetherAI endpoint so we can use withStructuredOutput
  const togetherModel = new ChatOpenAI({
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    temperature: 0,
    apiKey: process.env.TOGETHER_AI_API_KEY,
    configuration: {
      baseURL: 'https://api.together.xyz/v1',
    },
  }).withStructuredOutput(tool);
  const togetherChain = prompt.pipe(togetherModel).pipe(tool);

  const input = {
    question: example.inputs.input,
    answer: run.outputs.generatedAnswer,
    baseline: example.outputs.baselineAnswer,
    context: example.inputs.context
      .map((c: DocumentInterface) => c.pageContent)
      .join('\n'),
  };

  console.log("\n---The jury is running!---\n")
  const results = await Promise.all([
    openAIChain.invoke(input).then((result) => ({ result, model: 'openai' })),
    anthropicChain
      .invoke(input)
      .then((result) => ({ result, model: 'anthropic' })),
    togetherChain
      .invoke(input)
      .then((result) => ({ result, model: 'together' })),
  ]);

  const parsedResults: number[] = results.map((r) => {
    // Sometimes the LLM will not respect the enum values exactly, so we must round.
    let parsed = Math.round(JSON.parse(r.result).score);
    // Since we're rounding, we must account for the possibility of a score of 5 or 0
    if (parsed === 5) parsed = 4;
    if (parsed === 0) parsed = 1;

    switch (parsed) {
      case 1:
        return 100;
      case 2:
        return 66;
      case 3:
        return 33;
      case 4:
        return 0;
      default:
        throw new Error(`Invalid score. ${parsed} is not a valid score.\nRaw: ${r.result}`);
    }
  });

  const aggregateScore =
    parsedResults.reduce((acc, score) => acc + score, 0) / parsedResults.length;

  return {
    key: 'aggregate_score',
    score: Number(aggregateScore.toFixed(2)),
    evaluatorInfo: {
      individualScores: results,
    },
  };
}

async function pdfToChatApi(
  args: Record<string, any>,
): Promise<{ generatedAnswer: string }> {
  const llm = new ChatTogetherAI({
    model: process.env.TOGETHER_EVAL_MODEL,
    temperature: 0,
  });
  const answer = await generateBaselineAnswer(
    {
      input: args.input,
      context: args.context,
    },
    llm,
  );
  return {
    generatedAnswer: answer,
  };
}

async function runEval() {
  if (!process.env.TOGETHER_EVAL_MODEL) {
    throw new Error('TOGETHER_EVAL_MODEL is required.');
  }
  const client = new Client();
  const examples = client.listExamples({
    datasetName: process.env.LS_DATASET_NAME,
  });

  const targetRunnable = new RunnableLambda({
    func: pdfToChatApi,
  });
  const evalResults = await evaluate(targetRunnable, {
    data: examples,
    evaluators: [jury],
    experimentPrefix: `pdftochat-${process.env.TOGETHER_EVAL_MODEL}`,
    maxConcurrency: 10,
  });

  console.log("\n---Evaluation Results---\n")
  console.log(`pdftochat-${process.env.TOGETHER_EVAL_MODEL}`);
  console.log(evalResults.results[0].evaluationResults);
}

runEval();
