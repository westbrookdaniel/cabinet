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
