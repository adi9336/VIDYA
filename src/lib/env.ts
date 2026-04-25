function optional(key: string): string | undefined {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  openAiApiKey: optional("OPENAI_API_KEY"),
  elevenLabsApiKey: optional("ELEVENLABS_API_KEY"),
  speechToTextProvider: process.env.SPEECH_TO_TEXT_PROVIDER ?? "mock",
  textToSpeechProvider: process.env.TEXT_TO_SPEECH_PROVIDER ?? "mock",
  modelProvider: process.env.MODEL_PROVIDER ?? "mock",
  openAiTextModel: process.env.OPENAI_TEXT_MODEL ?? "gpt-4.1-mini",
  openAiTranscribeModel: process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe",
  openAiTtsModel: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
  openAiTtsVoice: process.env.OPENAI_TTS_VOICE ?? "cedar",
  elevenLabsSttModel: process.env.ELEVENLABS_STT_MODEL ?? "scribe_v2",
  elevenLabsTtsModel: process.env.ELEVENLABS_TTS_MODEL ?? "eleven_flash_v2_5",
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb",
  liveKitUrl: optional("LIVEKIT_URL"),
  liveKitApiKey: optional("LIVEKIT_API_KEY"),
  liveKitApiSecret: optional("LIVEKIT_API_SECRET")
};
