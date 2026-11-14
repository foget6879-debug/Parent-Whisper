import { useCallback, useEffect, useState } from 'react';
import Backdrop from '@/components/persuade/Backdrop';
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
import { useBackground } from '@/hooks/useBackground';
import { useTheme } from '@/hooks/useTheme';
import { useSound } from '@/hooks/useSound';
import { useAmbience } from '@/hooks/useAmbience';
import { useLanguage } from '@/i18n/LanguageContext';
import { playSound } from '@/lib/sound';

function App() {
  const { t } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  const { enabled: soundEnabled, toggle: toggleSound } = useSound();
  const ambience = useAmbience();
  const { background, setBackground } = useBackground();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    playSound('close');
  }, []);

  useEffect(() => {
    document.title = t.meta.title;
  }, [t.meta.title]);

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
      <Backdrop background={background} />
      <SiteHeader
        theme={theme}
        soundEnabled={soundEnabled}
        ambience={ambience}
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
      <footer className="mx-auto mt-4 max-w-6xl px-4 pb-12 sm:px-6 text-center">
        <div className="border-t border-slate-200/70 pt-8 dark:border-white/10">
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.footer.note}</p>
          <p className="mt-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            {t.footer.brand}
          </p>
        </div>
      </footer>
      {settingsOpen && (
        <SettingsModal onClose={closeSettings} background={background} onChangeBackground={setBackground} />
      )}
    </div>
  );
}

export default App;
