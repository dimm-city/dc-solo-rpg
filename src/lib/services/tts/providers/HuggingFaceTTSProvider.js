import { InferenceClient } from "@huggingface/inference";
//https://huggingface.co/hexgrad/Kokoro-82M?inference_api=true&inference_provider=fal-ai&language=python&client=huggingface_hub

const client = new InferenceClient(process.env.HF_TOKEN);

const audio = await client.textToSpeech({
    provider: "auto",
    model: "hexgrad/Kokoro-82M",
	inputs: "The answer to the universe is 42",
});
// Use the generated audio (it's a Blob)

//https://huggingface.co/hexgrad/Kokoro-82M?inference_api=true&inference_provider=fal-ai&language=js&client=fetch
async function query(data) {
	const response = await fetch(
		"https://router.huggingface.co/fal-ai/fal-ai/kokoro/american-english",
		{
			headers: {
				Authorization: `Bearer ${process.env.HF_TOKEN}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
    const result = await response.json();
    return result;
}

query({ text: "The answer to the universe is 42" }).then((response) => {
    console.log(JSON.stringify(response));
});