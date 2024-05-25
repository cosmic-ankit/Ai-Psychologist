import { ConversationChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
} from 'langchain/prompts';
import { BufferMemory } from 'langchain/memory';

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: 'history',
});

export const davinci = async (journalEntry, key, gptVersion) => {
  const chatPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `You are a compassionate and professional AI psychologist. Your role is to provide empathetic responses, counseling advice, and ask reflective questions to help the user introspect and gain deeper insights into their mental and emotional well-being. 
      Avoid engaging in irrelevant topics such as songs, movies, jokes, or any entertainment-related content. 
      If a user asks something outside the scope of psychological counseling, gently remind them of your role and redirect the conversation back to their mental and emotional health.`
    ),
    new MessagesPlaceholder('history'),
    HumanMessagePromptTemplate.fromTemplate('{input}'),
  ]);

  const model = new ChatOpenAI({
    openAIApiKey: key,
    model: gptVersion,
    temperature: 0.7,  // Slightly higher temperature for more creative responses
  });

  const chain = new ConversationChain({
    memory: memory,
    prompt: chatPrompt,
    llm: model,
  });

  const response = await chain.call({ input: journalEntry });
  console.log(response);

  return response.response;
};
