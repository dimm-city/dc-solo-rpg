/** @type {import('./$types').PageLoad} */
export async function load({ data }) {
    
    console.log("Signin Page Client Load - Data:", data);
    if (data?.session?.user) {
        console.log("User already signed in, redirecting to /");
        throw redirect(303, '/');
    }
    return {};
};