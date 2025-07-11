// app/api/transcribe/route.js

import { NextResponse } from 'next/server';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_API_URL = 'https://api.assemblyai.com/v2';

// Fonction pour attendre un certain temps
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
    if (!ASSEMBLYAI_API_KEY) {
        return NextResponse.json({ error: "La clé d'API AssemblyAI n'est pas configurée sur le serveur." }, { status: 500 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const audioUrlFromForm = formData.get('audio_url');
        let audioUrl;

        console.log('API: Fichier reçu:', file && file instanceof File ? `${file.name} (${file.size} bytes)` : 'Aucun fichier');

        // --- Étape 1: Obtenir l'URL de l'audio ---
        if (file) {
            // Si un fichier est fourni, le téléverser
            const uploadResponse = await fetch(`${ASSEMBLYAI_API_URL}/upload`, {
                method: 'POST',
                headers: { 'authorization': ASSEMBLYAI_API_KEY },
                body: file,
            });
            const uploadData = await uploadResponse.json();
            if (uploadData.error) {
                throw new Error(`Erreur de téléversement: ${uploadData.error}`);
            }
            audioUrl = uploadData.upload_url;
        } else if (audioUrlFromForm) {
            // Sinon, utiliser l'URL fournie
            audioUrl = audioUrlFromForm;
        } else {
            return NextResponse.json({ error: "Aucun fichier ou URL audio fourni." }, { status: 400 });
        }

        // --- Étape 2: Soumettre l'audio pour transcription ---
        const transcriptResponse = await fetch(`${ASSEMBLYAI_API_URL}/transcript`, {
            method: 'POST',
            headers: {
                'authorization': ASSEMBLYAI_API_KEY,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                audio_url: audioUrl,
                speaker_labels: true,
                language_code: "fr",
            }),
        });
        const transcriptData = await transcriptResponse.json();
        if (transcriptData.error) {
            throw new Error(`Erreur de transcription: ${transcriptData.error}`);
        }

        const transcriptId = transcriptData.id;

        // --- Étape 3: Attendre la fin de la transcription ---
        while (true) {
            const pollResponse = await fetch(`${ASSEMBLYAI_API_URL}/transcript/${transcriptId}`, {
                headers: { 'authorization': ASSEMBLYAI_API_KEY },
            });
            const pollData = await pollResponse.json();

            if (pollData.status === 'completed') {
                console.log('API: Transcription terminée:', pollData.text?.substring(0, 100) + '...');
                return NextResponse.json(pollData);
            } else if (pollData.status === 'error') {
                throw new Error(`La transcription a échoué: ${pollData.error}`);
            } else {
                // Attendre avant de vérifier à nouveau
                await sleep(3000);
            }
        }

    } catch (error) {
        console.error("Erreur dans la route API:", error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}