import Section from '@/components/Section.tsx';

function Home() {
    let count = 1;

    if (typeof document !== 'undefined') {
        const el = document.querySelector('#home');
        if (el) el.textContent = 'Hello World';
    }

    return (
        <div>
            <Section>
                <>
                    <h1 style='color: red;' id='home'>
                        Home Page
                    </h1>
                    <p>This is my string jsx</p>
                </>
            </Section>
            <Section>
                <button
                    onclick={(e) => {
                        const el = e.target as HTMLButtonElement;
                        el.textContent = `Clicked ${count++}`;
                    }}
                >
                    Click Me
                </button>
            </Section>
        </div>
    );
}

Home.meta = {
    hydrate: true,
};

export default Home;
