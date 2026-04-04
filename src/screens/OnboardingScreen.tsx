import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WR_ONBOARD = 'wr-onboarded';
const LEGACY_KEY = 'onboarding_complete';

type OnboardingScreenProps = {
  onFinish: () => void;
};

export function isOnboardingComplete(): boolean {
  try {
    return localStorage.getItem(WR_ONBOARD) === '1' || localStorage.getItem(LEGACY_KEY) === '1';
  } catch {
    return false;
  }
}

function markComplete(): void {
  try {
    localStorage.setItem(WR_ONBOARD, '1');
    localStorage.setItem(LEGACY_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [slide, setSlide] = useState(0);

  const finish = () => {
    markComplete();
    onFinish();
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-[#0f0a06] px-4 pb-10 pt-12">
      {slide < 3 ? (
        <button
          type="button"
          className="absolute right-4 top-4 text-sm text-[#a89880] underline"
          onClick={finish}
        >
          Skip
        </button>
      ) : null}

      <div className="mb-6 flex justify-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${i === slide ? 'bg-[#c9a227]' : 'bg-[#2a2018]'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {slide === 0 ? (
          <motion.div
            key="s0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-1 flex-col items-center text-center"
          >
            <motion.span
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-8xl"
            >
              🏰
            </motion.span>
            <h1 className="mt-8 font-title text-2xl font-bold text-[#c9a227]">Welcome to WordRealms</h1>
            <p className="mt-3 font-body text-[#c4b5a0]">Connect letters. Build your kingdom.</p>
            <button type="button" className="fantasy-button mt-auto w-full max-w-sm" onClick={() => setSlide(1)}>
              Next
            </button>
          </motion.div>
        ) : null}

        {slide === 1 ? (
          <motion.div
            key="s1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-1 flex-col items-center"
          >
            <p className="text-center font-title text-lg text-[#c9a227]">Letter wheel</p>
            <div className="mt-8 flex h-40 w-40 items-center justify-center rounded-full border-2 border-[#6b5510] bg-[#080608]">
              <span className="font-cinzel text-4xl text-[#c9a227]">ABC</span>
            </div>
            <p className="mt-8 text-center font-body text-[#c4b5a0]">Swipe letters to form words</p>
            <p className="mt-1 text-center text-sm text-[#6b6358]">Every word earns resources</p>
            <button type="button" className="fantasy-button mt-auto w-full max-w-sm" onClick={() => setSlide(2)}>
              Next
            </button>
          </motion.div>
        ) : null}

        {slide === 2 ? (
          <motion.div
            key="s2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-1 flex-col items-center text-center"
          >
            <p className="font-title text-lg text-[#c9a227]">Your realm</p>
            <div className="mt-8 grid grid-cols-3 gap-2 opacity-90">
              {['🏠', '🏪', '🗼', '🪣', '⛩️', '🏰'].map((e) => (
                <span key={e} className="text-4xl">
                  {e}
                </span>
              ))}
            </div>
            <p className="mt-8 font-body text-[#c4b5a0]">Build your fantasy kingdom</p>
            <p className="mt-1 text-sm text-[#6b6358]">Place buildings, grow your realm</p>
            <button type="button" className="fantasy-button mt-auto w-full max-w-sm" onClick={() => setSlide(3)}>
              Next
            </button>
          </motion.div>
        ) : null}

        {slide === 3 ? (
          <motion.div
            key="s3"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col items-center text-center"
          >
            <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <span className="text-6xl text-[#cd7f32]">🛡️</span>
            </motion.div>
            <h2 className="mt-6 font-title text-xl text-[#c9a227]">Compete in weekly leagues</h2>
            <p className="mt-2 font-body text-sm text-[#c4b5a0]">Climb from Bronze to Diamond</p>
            <button type="button" className="fantasy-button mt-10 w-full max-w-sm text-lg" onClick={finish}>
              START YOUR ADVENTURE
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
