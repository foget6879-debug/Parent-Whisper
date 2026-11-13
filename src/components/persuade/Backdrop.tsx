import type { BackgroundId } from '@/hooks/useBackground';
import CityBackdrop from '@/components/persuade/CityBackdrop';
import CursorFirefly from '@/components/persuade/CursorFirefly';
import GradientBackdrop from '@/components/persuade/GradientBackdrop';
import SpaceBackdrop from '@/components/persuade/SpaceBackdrop';

interface BackdropProps {
  background: BackgroundId;
}

export default function Backdrop({ background }: BackdropProps) {
  return (
    <>
      {background === 'gradient' ? <GradientBackdrop /> : background === 'space' ? <SpaceBackdrop /> : <CityBackdrop />}
      <CursorFirefly />
    </>
  );
}
