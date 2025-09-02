import { AIModel, TestCase } from '../types';
import { generateTestCases as generateWithGemini } from './geminiService';
import { generateTestCases as generateWithOpenAI } from './openaiService';
import { generateTestCases as generateWithLambda } from './lambdaService';

export const generateTestCases = (requirementText: string, model: AIModel): Promise<TestCase[]> => {
    switch(model) {
        case AIModel.Gemini:
            return generateWithGemini(requirementText);
        case AIModel.OpenAI:
            return generateWithOpenAI(requirementText);
        case AIModel.Lambda:
            return generateWithLambda(requirementText);
        default:
            // Fallback or error
            console.error(`Unsupported AI model selected: ${model}`);
            throw new Error(`The selected AI model is not supported.`);
    }
};
