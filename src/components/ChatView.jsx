import { useState, useRef, useEffect, useContext } from 'react';
import Message from './Message';
import { ChatContext } from '../context/chatContext';
import Thinking from './Thinking';
import { MdSend } from 'react-icons/md';
import { replaceProfanities } from 'no-profanity';
import { davinci } from '../utils/davinci';
import Modal from './Modal';
import Setting from './Setting';

const gptModel = ['gpt-3.5-turbo', 'gpt-4'];
const template = [
  {
    title: 'Plan a trip',
    prompt: 'I want to plan a trip to New York City.',
  },
  {
    title: 'how to make a cake',
    prompt: 'How to make a cake with chocolate and strawberries?',
  },
  {
    title: 'Business ideas',
    prompt: 'Generate 5 business ideas for a new startup company.',
  },
  {
    title: 'What is recursion?',
    prompt: 'What is recursion? show me an example in python.',
  },
];

const ChatView = () => {
  const messagesEndRef = useRef();
  const inputRef = useRef();
  const [formValue, setFormValue] = useState('');
  const [thinking, setThinking] = useState(false);
  const [gpt, setGpt] = useState(gptModel[0]);
  const [messages, addMessage] = useContext(ChatContext);
  const [modalOpen, setModalOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateMessage = (newValue, ai = false) => {
    const id = Date.now() + Math.floor(Math.random() * 1000000);
    const newMsg = {
      id: id,
      createdAt: Date.now(),
      text: newValue,
      ai: ai,
    };

    addMessage(newMsg);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const key = window.localStorage.getItem('api-key');
    if (!key) {
      setModalOpen(true);
      return;
    }

    const cleanPrompt = replaceProfanities(formValue);
    const newMsg = cleanPrompt;
    const gptVersion = gpt;

    setThinking(true);
    setFormValue('');
    updateMessage(newMsg, false);
    console.log(gptVersion);

    try {
      const LLMresponse = await davinci(cleanPrompt, key, gptVersion);
      LLMresponse && updateMessage(LLMresponse, true);
    } catch (err) {
      window.alert(`Error: ${err} please try again later`);
    }

    setThinking(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage(e);
    }
  };

  const endSession = async () => {
    const key = window.localStorage.getItem('api-key');
    if (!key) {
      setModalOpen(true);
      return;
    }

    const gptVersion = gpt;
    const summaryPrompt = `
Summarize the session we just had in clear and concise bullet points. Ensure the summary captures the main topics discussed, key insights, and important details. Additionally, based on the conversation, provide actionable advice and mentorship in bullet points, including:

1. Highlights of the discussion.
2. Key takeaways or conclusions.
3. Suggested next steps or actions.
4. Tips or best practices relevant to the topics discussed.
5. Any resources or tools that might be helpful.

Please structure the response clearly, starting with the summary followed by the advice and mentorship section.
`;


    setThinking(true);

    try {
      const LLMresponse = await davinci(summaryPrompt, key, gptVersion);
      LLMresponse && updateMessage(LLMresponse, true);
    } catch (err) {
      window.alert(`Error: ${err} please try again later`);
    }

    setThinking(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking]);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <main className='relative flex flex-col h-screen p-1 overflow-hidden dark:bg-light-grey'>
      <div className='mx-auto my-4 tabs tabs-boxed w-fit'>
      <a
  onClick={() => setGpt(gptModel[0])}
  className={`tab ${gpt === gptModel[0] ? 'tab-active' : ''}`}
  style={{ backgroundColor: gpt === gptModel[0] ? 'hsl(213, 27%, 84%)' : '', color: 'black' }}>
  GPT-3.5
</a>
<a
  onClick={() => setGpt(gptModel[1])}
  className={`tab ${gpt === gptModel[1] ? 'tab-active' : ''}`}
  style={{ backgroundColor: gpt === gptModel[1] ? 'hsl(213, 27%, 84%)' : '', color: 'black' }}>
  GPT-4
</a>

      </div>

      <section className='flex flex-col flex-grow w-full px-4 overflow-y-scroll sm:px-10 md:px-32'>
        {messages.length ? (
          messages.map((message, index) => (
            <Message key={index} message={{ ...message }} />
          ))
        ) : (
          <div className='flex my-2'>
            <div className='w-screen overflow-hidden'>
              <ul className='grid grid-cols-2 gap-2 mx-10'>
                {template.map((item, index) => (
                  <li
                    onClick={() => setFormValue(item.prompt)}
                    key={index}
                    className='p-6 border rounded-lg border-slate-300 hover:border-slate-500'>
                    <p className='text-base font-semibold'>{item.title}</p>
                    <p className='text-sm'>{item.prompt}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {thinking && <Thinking />}

        <span ref={messagesEndRef}></span>
      </section>
     
     <form
  className='flex flex-col px-10 mb-6 md:px-32 join sm:flex-row'
  onSubmit={sendMessage}>
  <div className='flex items-stretch justify-between w-full'>
    <textarea
      ref={inputRef}
      className='w-full grow input input-bordered join-item max-h-[20rem] min-h-[3rem]'
      value={formValue}
      onKeyDown={handleKeyDown}
      onChange={(e) => setFormValue(e.target.value)}
    />
    <button type='submit' className='join-item btn' disabled={!formValue}>
      <MdSend size={30} />
    </button>
  </div>
  <button
    type='button'
    onClick={endSession}
    className='btn btn-blue btn-outline mt-2 md:mt-0'>
    End Session
  </button>
</form>


      <Modal title='Setting' modalOpen={modalOpen} setModalOpen={setModalOpen}>
        <Setting modalOpen={modalOpen} setModalOpen={setModalOpen} />
      </Modal>
    </main>
  );
};

export default ChatView;
