export default function Home() {
  let count = 1
  return (
    <div>
      <h1 style="color: red;" id="home">
        Home Page
      </h1>
      <p>This is my string jsx</p>
      <button
        onclick={(e) => {
          const el = e.target as HTMLButtonElement
          el.textContent = `Clicked ${count++}`
        }}
      >
        Click Me
      </button>
    </div>
  )
}

export const meta = {
  hydrate: true,
}
