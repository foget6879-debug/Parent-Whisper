import { useCallback, useState } from 'react';
import CityBackdrop from '@/components/persuade/CityBackdrop';
import SiteHeader from '@/components/persuade/SiteHeader';
import SettingsModal from '@/components/persuade/SettingsModal';
import Hero from '@/components/persuade/Hero';
import ProblemSection from '@/components/persuade/ProblemSection';
import AnalogyCards from '@/components/persuade/AnalogyCards';
import BeforeAfterSlider from '@/components/persuade/BeforeAfterSlider';
import BenefitCalculator from '@/components/persuade/BenefitCalculator';
import CostOfWaiting from '@/components/persuade/CostOfWaiting';
import Options from '@/components/persuade/Options';
import DeviceCompare from '@/components/persuade/DeviceCompare';
import Objections from '@/components/persuade/Objections';
import Guarantees from '@/components/persuade/Guarantees';
import FinalCta from '@/components/persuade/FinalCta';
import { useTheme } from '@/hooks/useTheme';
import { useSound } from '@/hooks/useSound';
import { playSound } from '@/lib/sound';

function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { enabled: soundEnabled, toggle: toggleSound } = useSound();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    playSound('close');
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
    playSound('toggle-on');
  };

  const handleToggleSound = () => {
    toggleSound();
  };

  const handleOpenSettings = () => {
    setSettingsOpen(true);
    playSound('open');
  };

  return (
    <div className="relative min-h-screen">
      <CityBackdrop />
      <SiteHeader
        theme={theme}
        soundEnabled={soundEnabled}
        onToggleTheme={handleToggleTheme}
        onToggleSound={handleToggleSound}
        onOpenSettings={handleOpenSettings}
      />
      <main>
        <Hero />
        <ProblemSection />
        <AnalogyCards />
        <BeforeAfterSlider />
        <BenefitCalculator />
        <CostOfWaiting />
        <Options />
        <DeviceCompare />
        <Objections />
        <Guarantees />
        <FinalCta />
      </main>
      <footer className="mx-auto mt-4 max-w-6xl px-6 pb-12 text-center">
        <div className="border-t border-slate-200/70 pt-8 dark:border-white/10">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Цифри на сторінці орієнтовні: їх можна замінити на свої заміри та актуальні ціни в магазинах.
          </p>
          <p className="mt-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Parent Whisper · 2026
          </p>
        </div>
      </footer>
      {settingsOpen && <SettingsModal onClose={closeSettings} />}
    </div>
  );
}

export default App;
