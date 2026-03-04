import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

import {
  fetchChambersDockData,
  getChambersDockSnapshot,
} from '../../lib/chambersDockCache';

function createDefaultDockState(length = 0) {
  return Array.from({ length }, () => ({ scale: 1, lift: 0, glow: 0.18 }));
}

function Chambers() {
  const itemRefs = useRef([]);
  const animationFrameRef = useRef(0);
  const [dockItems, setDockItems] = useState([]);
  const [dockState, setDockState] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const snapshot = getChambersDockSnapshot();
    if (snapshot.data.length > 0) {
      setDockItems(snapshot.data);
      setDockState(createDefaultDockState(snapshot.data.length));
    }

    const loadChambers = async () => {
      const nextItems = await fetchChambersDockData({ force: snapshot.isStale });

      if (cancelled) {
        return;
      }

      setDockItems(nextItems);
      setDockState((currentState) =>
        currentState.length === nextItems.length
          ? currentState
          : createDefaultDockState(nextItems.length)
      );
    };

    loadChambers();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, dockItems.length);
  }, [dockItems.length]);

  const applyDockEffectFromX = (clientX) => {
    const nextState = dockItems.map((_, index) => {
      const node = itemRefs.current[index];

      if (!node) {
        return { scale: 1, lift: 0, glow: 0.18 };
      }

      const rect = node.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const distance = Math.abs(clientX - centerX);
      const reach = 150;
      const intensity = Math.max(0, 1 - distance / reach);
      const eased = intensity * intensity;

      return {
        scale: 1 + eased * 0.92,
        lift: eased * 22,
        glow: 0.18 + eased * 0.62,
      };
    });

    setDockState(nextState);
  };

  const handleDockMove = (event) => {
    const clientX = event.clientX;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      applyDockEffectFromX(clientX);
      animationFrameRef.current = 0;
    });
  };

  const resetDock = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }

    setDockState(createDefaultDockState(dockItems.length));
  };

  const handleItemFocus = (index) => {
    const node = itemRefs.current[index];

    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();
    applyDockEffectFromX(rect.left + rect.width / 2);
  };

  if (dockItems.length === 0) {
    return null;
  }

  return (
    <section className="chambersSection">
      <div
        className="site-shell chambersRail"
        onPointerMove={handleDockMove}
        onPointerLeave={resetDock}
      >
        <div className="chambersTrack" role="list" aria-label="TMMOB odaları">
          {dockItems.map((oda, index) => {
            const itemState = dockState[index] || { scale: 1, lift: 0, glow: 0.18 };
            const labelOpacity = Math.max(0, Math.min(1, (itemState.scale - 1.5) / 0.22));
            const chamberLabel = oda.name || oda.short;

            const logoNode = (
              <Image
                className="chambersLogo"
                src={oda.logoSrc}
                width={64}
                height={64}
                alt={`${chamberLabel} logosu`}
                sizes="64px"
              />
            );

            return (
              <div
                key={oda.id}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className="chambersItem"
                role="listitem"
                style={{
                  '--dock-scale': itemState.scale,
                  '--dock-lift': `${itemState.lift}px`,
                  '--dock-glow': itemState.glow,
                  '--dock-label-opacity': labelOpacity,
                  zIndex: Math.round(itemState.scale * 100),
                }}
              >
                {oda.href ? (
                  <a
                    href={oda.href}
                    className="chambersLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${chamberLabel} web sitesini ac`}
                    onFocus={() => handleItemFocus(index)}
                    onBlur={resetDock}
                  >
                    {logoNode}
                  </a>
                ) : (
                  <span className="chambersLink" aria-hidden="true">
                    {logoNode}
                  </span>
                )}
                <span className="chambersLabel" aria-hidden="true">
                  {oda.short}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Chambers;
