import type { PageType } from '@/lib/types.ts';
import Navigation from '@/components/Navigation.tsx';
import { postJson, withFormData } from '@/lib/utils.ts';

function set(id: string, text: string) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

const Net: PageType = () => {
    async function handleGet() {
        if (typeof document === 'undefined') return;
        set('get-res', 'Loading...');
        const res = await fetch('/api/net');
        const json = await res.json();
        set('get-res', JSON.stringify(json));
    }
    handleGet();

    return (
        <div>
            <h1>Network Behaviours</h1>
            <Navigation />

            <div style='display: flex; flex-direction: column; gap: 32px;'>
                <div>
                    <p>GET Request</p>
                    <div style='display: flex; gap: 8px; margin-top: 16px;'>
                        <button
                            onclick={handleGet}
                        >
                            Go!
                        </button>
                        <div id='get-res' />
                    </div>
                </div>
                <form
                    onsubmit={withFormData<{ name: string }>(async (data, el) => {
                        set('post-res', 'Loading...');
                        const res = await fetch('/api/net', postJson(data));
                        const json = await res.json();
                        set('post-res', JSON.stringify(json));
                        if (res.status === 200) el.reset();
                    })}
                >
                    <p>POST Request</p>
                    <label style='display: flex; flex-direction: column; font-size: 12px; gap: 4px; width: 150px;'>
                        Name
                        <input name='name' style='margin-right: 4px;' />
                    </label>
                    <div style='display: flex; gap: 8px; margin-top: 16px;'>
                        <button>Go!</button> <div id='post-res' />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Net;
