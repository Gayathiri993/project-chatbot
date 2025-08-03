
import { useState } from 'react';
import './App.css'
import { BsThreeDots } from "react-icons/bs";

export default function MedicalQuestionApp() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [qaList, setQaList] = useState([]); // [ADDED]
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiResponse = await fetchLLMResponse(question);

      // Save to list
      setQaList((prev) => [...prev, { question, answer: apiResponse }]); // [ADDED]

      setResponse(apiResponse);
      setQuestion('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  //Api fetching -Post method

  const fetchLLMResponse = async (question) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful medical assistant." },
          { role: "user", content: question }
        ]
      })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  };

  return (
    <div className='w-full min-h-screen bg-[#212121]'>
      <div className="py-12 px-4 sm:px-6 lg:px-8" >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-[400] text-[#ffffff] mb-2 font-inter ">Doctor Hub</h1>
          </div>
         {/** error handling */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4  rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="mt-12 mb-12 bg-[#171717] rounded-xl shadow-sm w-[740px]">
            <div className="p-6">
              <h2 className=" text-[#ffffff] font-inter font-[300] text-[16px] mb-4">Response</h2>

              {/* [ADDED] Render all previous Q&A */}
              {qaList.map((qa, index) => (
                <div key={index} className="mb-6">
                  <p className="text-[#ffffff] font-inter font-[400] text-[16px] mb-2">
                    <strong>Q:</strong> {qa.question}
                  </p>
                  <div className="prose prose-blue max-w-none text-[#ffffff] font-inter font-[400] text-[16px] leading-7" style={{ wordSpacing: '0.1rem' }}>
                    {qa.answer.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                  <hr className="my-4 border-gray-600" />
                </div>
              ))}

              {/* [UNCHANGED] Loading indicator */}
              {isLoading ? (
                <div className="flex items-center space-x-2 text-[#ffff]font-inter font-[300] text-[16px] ">
                  <BsThreeDots className='text-[#ffff] text-[20px]' />
                </div>
              ) : response ? null : (
                <p></p>
              )}
            </div>
          </div>
            {/**From tag for users input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative w-[740px]">
              <textarea
                id="question"
                name="question"
                rows={4}
                className="w-full h-[98px] px-4 py-3 bg-[#303030] rounded-xl shadow-sm border-none  focus:outline-none resize-none text-white font-inter font-[300] text-[16px] pr-12"
                placeholder="Ask anything"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="absolute bottom-4 right-3  border bg-[#ffffff] rounded-full pl-[3px] pr-[3px] pt-[3px] pb-[3px] cursor-pointer"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                  <path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z" />
                </svg>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
