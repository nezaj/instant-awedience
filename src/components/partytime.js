import { init } from '@instantdb/react';
import { createRef, useRef } from 'react';

const db = init({
  appId: "d7e379b9-9744-4ba1-a7d4-4b022080338d",
});

const { usePublishTopic, useTopicEffect } = db.room('main', '123');


export default function InstantTopics() {
  const sendEmoji = usePublishTopic('emoji');

  useTopicEffect(
    'emoji',
    ({ name, directionAngle, rotationAngle }) => {
      if (!emoji[name]) return;
      emote(
        { emoji: emoji[name], directionAngle, rotationAngle },
        elRefsRef.current[name].current
      );
    }
  );

  const elRefsRef = useRef(refsInit);

  return (
    <div className="flex gap-4">
      {emojiNames.map((name) => (
        <div className="relative" key={name} ref={elRefsRef.current[name]}>
          <button
            className={emojiClassNames}
            onClick={() => {
              const params = {
                name,
                rotationAngle: 360 * Math.random(),
                directionAngle: 135 + Math.random() * 90,
              };
              emote(
                {
                  emoji: emoji[name],
                  rotationAngle: params.rotationAngle,
                  directionAngle: params.directionAngle,
                },
                elRefsRef.current[name].current
              );

              sendEmoji(params);
            }}
          >
            {emoji[name]}
          </button>
        </div>
      ))}
    </div>
  );
}

function emote(
  config,
  target
) {
  if (!target) return;
  const d1 = document.createElement('div');
  const d2 = document.createElement('div');
  const d3 = document.createElement('div');

  target.appendChild(d1);
  d1.appendChild(d2);
  d2.appendChild(d3);
  d3.innerText = config.emoji;

  requestAnimationFrame(() => {
    setTimeout(() => {
      Object.assign(d2.style, {
        transform: `translateY(80vh) scale(2)`,
        transition: 'all 400ms',
        opacity: '0',
      });
    });
  });

  setTimeout(() => d1.remove(), 800);

  Object.assign(d1.style, {
    transform: `rotate(${config.directionAngle}deg)`,
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    margin: 'auto',
    zIndex: '9999',
    pointerEvents: 'none',
  });

  Object.assign(d3.style, {
    transform: `rotateZ(${config.rotationAngle}deg)`,
    fontSize: `40px`,
  });
}

const emoji = {
  fire: '🔥',
  wave: '👋',
  confetti: '🎉',
  heart: '❤️',
};

const emojiNames = Object.keys(emoji);

const refsInit = Object.fromEntries(
  emojiNames.map((name) => [name, createRef()])
);

const emojiClassNames =
  'rounded-lg bg-white p-3 text-3xl shadow-md transition duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl';
