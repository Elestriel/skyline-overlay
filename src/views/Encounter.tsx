import './Encounter.scss';
import { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { version } from '../assets/meta';
import {
  IChevronUpCircle,
  IChevronDownCircle,
  ISettings,
  IGitBranch,
} from '../assets/icons';
import { logInfo } from '../utils/loggers';
import { useStore } from '../hooks';
import { fmtNumber } from '../utils/formatters';

function Encounter() {
  const { api, settings } = useStore();
  const { active, encounter, overlay } = api;
  const { showCombatants, shortNumber, toggleShowCombatants } = settings;

  // encounter data
  let duration = encounter.duration || '00:00';
  const time = duration.split(':');
  if (time.length === 3) {
    // add hours to minutes
    const hours = Number.parseInt(time[0], 10);
    let minutes = Number.parseInt(time[1], 10);
    minutes = minutes + hours * 60;
    if (minutes > 99) {
      duration = '99:59';
    } else {
      duration = `${minutes}:${time[2]}`;
    }
  } else if (time.length > 3) {
    duration = '99:59';
  }
  const zoneName = encounter.zoneName || `Skyline Overlay ${version}`;

  /**
   * reset all combat data
   */
  const handleEndEncounter = useCallback(async () => {
    await overlay.endEncounter();
    logInfo('encounter ended');
  }, [overlay]);

  /**
   * hide or show combatants
   */
  const handleToggleShowCombatants = useCallback(() => {
    toggleShowCombatants();
  }, [toggleShowCombatants]);

  // overflow zonename related
  const [fullZoneName, setFullZoneName] = useState(false);
  const zoneWrapperRef = useRef<HTMLDivElement>(null);
  const zoneInnerRef = useRef<HTMLSpanElement>(null);
  /**
   * if inner text is too long, show full zone name when hovered
   */
  const handleShowFullZoneName = useCallback(() => {
    if (
      zoneWrapperRef.current &&
      zoneInnerRef.current &&
      zoneWrapperRef.current.offsetWidth < zoneInnerRef.current.offsetWidth
    ) {
      setFullZoneName(true);
    }
  }, []);
  const handleHideFullZoneName = useCallback(() => {
    setFullZoneName(false);
  }, []);

  // handle switch team dps/hps
  const [showDHPS, setShowDHPS] = useState<'dps' | 'hps'>('dps');
  const handleSwitchDHPS = useCallback(() => {
    setShowDHPS((prev) => (prev === 'dps' ? 'hps' : 'dps'));
  }, []);
  const totalDPS = encounter[showDHPS] || 0;

  return (
    <div className='encounter'>
      <div
        className={clsx('encounter-duration', {
          'encounter-duration--active': active,
        })}
      >
        <span>{duration}</span>
      </div>
      <div className='encounter-btn' onClick={handleEndEncounter}>
        <IGitBranch />
      </div>
      <div
        className={clsx('encounter-content', {
          'encounter-content--full': fullZoneName,
        })}
      >
        <div
          className='encounter-content-zone'
          ref={zoneWrapperRef}
          onMouseEnter={handleShowFullZoneName}
          onMouseLeave={handleHideFullZoneName}
        >
          <span ref={zoneInnerRef}>{zoneName}</span>
        </div>
        <div className='encounter-content-numbers' onClick={handleSwitchDHPS}>
          <span className='g-number'>{fmtNumber(shortNumber, totalDPS)}</span>
          <span className='g-counter'>{showDHPS.toUpperCase()}</span>
        </div>
      </div>
      <div className='encounter-btn' onClick={handleToggleShowCombatants}>
        {showCombatants ? <IChevronUpCircle /> : <IChevronDownCircle />}
      </div>
      <div className='encounter-btn' onClick={() => settings.toggleSettings()}>
        <ISettings />
      </div>
    </div>
  );
}

export default observer(Encounter);
