"use client";
import { useAuth } from "@/contexts/AuthContext";
import { IoClose } from "react-icons/io5";
import { RiRobot2Line, RiSendPlaneFill } from "react-icons/ri";

interface ChatProps {
  isAiLoading: boolean;
  showChat: boolean;
  toggleChat: () => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleSubmitPrompt: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export default function Chat({
  isAiLoading,
  showChat,
  toggleChat,
  prompt,
  setPrompt,
  handleSubmitPrompt,
}: ChatProps) {
  const { isPremium } = useAuth();

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={toggleChat}
          className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all transform hover:scale-110 ${isPremium ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white' : 'bg-zinc-700 text-zinc-200'}`}>
          <RiRobot2Line className="w-8 h-8" />
        </button>
      </div>

      {showChat && (
        <div className="fixed bottom-28 right-8 z-50 w-full max-w-md p-4 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl">
          <form onSubmit={handleSubmitPrompt} className="flex items-center gap-3">
            <div className="relative flex-grow">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                type="text"
                placeholder="Refine your recommendations..."
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 focus:border-violet-500 outline-none transition-colors"
                disabled={isAiLoading}
              />
              {prompt.length > 0 && !isAiLoading && (
                <button
                  type="button"
                  onClick={() => setPrompt("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  <IoClose className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              disabled={isAiLoading || !prompt.trim()}
              type="submit"
              className={`p-3 rounded-lg flex items-center justify-center transition-all ${isAiLoading || !prompt.trim() ? 'bg-violet-500/50 cursor-not-allowed' : 'bg-violet-500 hover:bg-violet-600'}`}>
              {isAiLoading ? (
                <div className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
              ) : (
                <RiSendPlaneFill className="w-5 h-5 text-white" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
