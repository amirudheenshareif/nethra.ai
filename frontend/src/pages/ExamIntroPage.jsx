import { Mic } from "lucide-react";
import { useEffect } from "react";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";



export const  ExamIntroPage = () => {

    const examIntro = async () => {
        const message = "Welcome user, You are now on the examination page. Tap anywhere on the screen when you are ready";
        try {
            const elevenlabs = new ElevenLabsClient({
                apiKey: import.meta.env.VITE_ELEVEN_LABS_API_KEY,
            });

            const audioStream = await elevenlabs.textToSpeech.convert(
                import.meta.env.VITE_ELEVEN_LABS_VOICE_ID,
                {
                    text: message,
                    modelId: 'eleven_multilingual_v2',
                    outputFormat: 'mp3_44100_128',
                }
            );

            const audioBlob = await new Response(audioStream).blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        }
             catch (error) {
            console.log(error);
         }  
    }

  return (
    <div onClick={examIntro} className="bg-[linear-gradient(135deg,#0a0e27_0%,#1a1f3a_50%,#0f1829_100%)] w-full min-h-screen flex flex-col justify-center items-center p-4" >
        <h1 className="text-2xl font-semibold tracking-tight mb-3 text-white text-center">EXAMINATION PAGE </h1>
        <p className="text-[#cbd5e1] opacity-0.9">Tap anywhere to continue</p>
         <Mic className="w-12 h-12 mt-6 text-blue-500 animate-pulse" />
    </div>
  );
}


