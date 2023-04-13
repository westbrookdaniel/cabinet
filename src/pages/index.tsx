/** @jsx s */

function s(nodeName: string, attributes: any, ...children: any[]) {
  console.log(nodeName, attributes, children)

  let querySelector = nodeName
  if (attributes?.id) querySelector += `#${attributes.id}`
  if (attributes?.q) querySelector = attributes.q

  const scripts: string[] = []

  const attributesStr = Object.keys(attributes ?? {}).reduce((acc, key) => {
    if (key === 'q') return acc

    if (key.startsWith('on')) {
      const event = key.slice(2).toLowerCase()
      scripts.push(`
const element = document.querySelector('${querySelector}');
element?.addEventListener('${event}', ${attributes[key].toString()});
      `)
      return acc
    }

    return `${acc} ${key}="${attributes[key]}"`
  }, '')

  const scriptsStr = scripts.length
    ? `<script>${scripts.join('')}</script>`
    : ''

  return `<${nodeName}${attributesStr}>${children.join(
    ''
  )}</${nodeName}>${scriptsStr}`
}

declare global {
  namespace JSX {
    type IntrinsicElements = {
      [K in keyof HTMLElementTagNameMap]: Omit<
        Partial<HTMLElementTagNameMap[K]>,
        'style' | 'className'
      > & {
        class?: string
        style?: string
      }
    }
  }
}

export default function Home() {
  return (
    <div>
      <h1 style="color: red;" id="home">
        Home Page
      </h1>
      <p>This is my string jsx</p>
      <button
        onclick={(e) => {
          const el = e.target as HTMLButtonElement
          el.dataset.count = (Number(el.dataset.count ?? 0) + 1).toString()
          el.textContent = `Clicked ${el.dataset.count}`
        }}
      >
        Click Me
      </button>
    </div>
  )
}
