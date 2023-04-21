export const getId = () => Math.random().toString(36);

export const withFormData = <T>(cb: (data: T, target: HTMLFormElement) => void) => (e: SubmitEvent) => {
    e.preventDefault();
    const el = e.target as HTMLFormElement;
    const formData = new FormData(el);
    const data = Object.fromEntries(formData.entries()) as T;
    cb(data, el);
};

// deno-lint-ignore no-explicit-any
export function postJson(json: Record<any, any>): RequestInit {
    return {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(json),
    };
}
