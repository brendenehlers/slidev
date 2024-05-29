import type { MarkdownTransformContext } from '@slidev/types'
import { diffLines } from 'diff'
import { reCodeBlock } from './code-wrapper'

// eslint-disable-next-line regexp/no-useless-quantifier, regexp/no-super-linear-backtracking
const reDifferBlock = /^````(?:md|markdown) differ(?: *(\{[^}]*\})?([^\n]*))?\n([\s\S]+?)````$/gm

export function transformDiffer(ctx: MarkdownTransformContext): void {
  ctx.s.replace(
    reDifferBlock,
    (full: any, _options, attrs = '', body: string) => {
      const matches = Array.from(body.matchAll(reCodeBlock))
      if (matches.length !== 2)
        throw new Error('Differ block must contain two code segments')

      const diff = diffLines(matches[0][5], matches[1][5])

      function formatDiffString(value: string, sep: string): string {
        const arr = value.split('\n')
        return `${arr
          .slice(0, arr.length - 1)
          .map(s => sep + s)
          .join('\n')}\n`
      }

      let value = ''
      for (const d of diff) {
        if (d.added) {
          value += formatDiffString(d.value, '+')
        }
        else if (d.removed) {
          value += formatDiffString(d.value, '-')
        }
        else {
          value += formatDiffString(d.value, ' ')
        }
      }

      return `\`\`\`diff${attrs}\n${value}\n\`\`\``
    },
  )
}
