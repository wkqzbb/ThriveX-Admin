import markerSvg from './icon/marker.svg?raw';
import calloutSvg from './icon/callout.svg?raw';
import noteSvg from './icon/note.svg?raw';
import tipSvg from './icon/tip.svg?raw';
import warningSvg from './icon/warning.svg?raw';
import checkSvg from './icon/check.svg?raw';
import dangerSvg from './icon/danger.svg?raw';

import gemoji from '@bytemd/plugin-gemoji';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import math from '@bytemd/plugin-math';
import type { BytemdPlugin } from 'bytemd';
import 'highlight.js/styles/vs2015.css';
import 'katex/dist/katex.css';
import rehypeCallouts from 'rehype-callouts';
import 'rehype-callouts/theme/obsidian';
import remarkFlexibleMarkers from "remark-flexible-markers";

const markers = (): BytemdPlugin => {
  return {
    remark: (processor) => processor.use(remarkFlexibleMarkers),
    actions: [
      {
        title: '标记',
        icon: markerSvg,
        handler: {
          type: 'action',
          click: (ctx) => {
            ctx.wrapText("==", "==");
          }
        }
      }
    ]
  }
}

const callouts = (): BytemdPlugin => {
  const calloutTypes = [
    { title: 'Note', icon: noteSvg, blockType: '[!NOTE]' },
    { title: 'Tip', icon: tipSvg, blockType: '[!TIP]' },
    { title: 'Warning', icon: warningSvg, blockType: '[!WARNING]' },
    { title: 'Check', icon: checkSvg, blockType: '[!CHECK]' },
    { title: 'Danger', icon: dangerSvg, blockType: '[!DANGER]' }
  ];
  return {
    rehype: (processor) => processor.use(rehypeCallouts),
    actions: [
      {
        icon: calloutSvg,
        handler: {
          type: 'dropdown',
          actions: calloutTypes.map(({ title, icon, blockType }) => ({
            title,
            icon,
            handler: {
              type: 'action',
              click: (ctx) => {
                ctx.appendBlock(`> ${blockType} ${title}\n> `);
              }
            }
          }))
        }
      }
    ]
  }
}

export default [
  gfm({ singleTilde: false }),
  // markers(),
  gemoji(),
  math(),
  highlight(),
  callouts()
];